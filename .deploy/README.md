# OpenClaw deployment

## Hostinger (VPS)

See [hostinger/](hostinger/) for docker-compose and config.

---

## Local development (and fixing 507 in Docker)

**If you see 507 when using Docker (including with cloudflared):** use the nginx sidecar so the proxy has the right buffer limits.

From the **hostinger** directory:
```bash
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d
```
Traffic goes: client/tunnel → **nginx:60185** (big buffers) → gateway:18789. No more 507 from the proxy.

- **Gateway only** (e.g. `node openclaw.mjs gateway --port 18789`): no nginx, so you won’t see 507 from this stack.
- **With nginx locally** (not Docker): add the [buffer snippet](#507-exceeded-request-buffer-limit-while-retrying-upstream) to the `server`/`location` that proxies to `http://127.0.0.1:18789`. Or use [nginx-openclaw-local.conf.example](nginx-openclaw-local.conf.example).

---

## 507 exceeded request buffer limit while retrying upstream

This error comes from **nginx** (or an nginx-based reverse proxy) in front of the OpenClaw gateway. When nginx retries a request to the upstream (OpenClaw), the request body can exceed the default buffer and trigger 507.

**Fix:** Use the provided nginx snippet so the proxy uses larger buffers and can re-send the body on retry.

1. **If you control nginx** (e.g. on the same host or a reverse-proxy container):
   - In the `server` or `location` block that proxies to OpenClaw, add:
     ```nginx
     include /path/to/.deploy/nginx-openclaw-upstream.conf;
     ```
   - Or copy the directives from [nginx-openclaw-upstream.conf](nginx-openclaw-upstream.conf) into that block.
   - Reload nginx: `nginx -t && systemctl reload nginx` (or your platform’s reload).

2. **If nginx is run by another layer** (e.g. cloudflared, load balancer, or host):
   - Apply the same `client_max_body_size`, `client_body_buffer_size`, `proxy_buffer_*`, and `proxy_request_buffering on` in that layer’s config for the OpenClaw upstream.
   - Increase values if you need to support larger uploads (e.g. `client_max_body_size 50M`).

Gateway default port: **18789** (Hostinger host mapping: **60185**).

---

## 502 upstream connect error / reset reason: protocol error

This usually comes from **Cloudflare** (or another Envoy-based proxy) in front of your origin. The proxy connects to your server but the connection is reset before any response headers — often because of an **HTTP/2 vs HTTP/1.1** mismatch.

**Fix:**

1. **Disable HTTP/2 to Origin** (if using Cloudflare):  
   In the Cloudflare dashboard go to **Speed → Optimization → Protocol Optimization** and turn **off** “HTTP/2 to Origin”. Your origin (Node/nginx) speaks HTTP/1.1; with HTTP/2 to origin enabled, Cloudflare can trigger a protocol error.

2. **SSL mode**: If the origin is plain HTTP, set Cloudflare SSL to **Flexible**. If the origin has TLS, use **Full** or **Full (strict)** and ensure the origin certificate is valid.

3. **Bypass Cloudflare** (grey cloud the DNS) briefly to confirm the origin responds when hit directly.

4. If you use the **nginx sidecar** ([docker-compose.nginx.yml](hostinger/docker-compose.nginx.yml)), nginx already uses `proxy_http_version 1.1` to the gateway; the mismatch is then between Cloudflare and your nginx. Turning off HTTP/2 to origin fixes that.

---

## 404 Azure Container App - Unavailable (chat / UI)

If you see **404** with HTML like `<title>Azure Container App - Unavailable</title>` (e.g. when opening the UI or when chat requests get a response), Azure is not routing traffic to your container — the request never reaches the OpenClaw gateway.

**Causes and fixes:**

1. **Ingress path**
   - In **Azure Container Apps** → your app → **Ingress**, ensure the path prefix includes **all** paths the UI and gateway use:
     - `/` (root and SPA)
     - `/__openclaw/control-ui-config.json` (bootstrap)
     - Any **WebSocket** upgrade (same host/path as the UI; ingress must allow the port and protocol).
   - Use a broad rule (e.g. path prefix `/` or `/*`) so every request hits the container.

2. **Container not running / unhealthy**
   - If the container is stopped or failing health checks, Azure serves the “Unavailable” page for any request.
   - Check **Revision management** and **Log stream** (or **Logs**) for crashes and failed probes. Fix startup, port (gateway must listen on the port exposed by the container, e.g. **80** or **PORT**), and health endpoint if configured.

3. **Port**
   - The gateway listens on **18789** by default. In Container Apps the app usually must listen on **80** or the port given in the **PORT** env var. Start the gateway with that port (e.g. `--port 80` or `PORT=80`) or run nginx in the container and proxy to 18789.

4. **Base path**
   - If you use `gateway.controlUi.basePath` (e.g. `/openclaw`), the UI and API paths are under that prefix. Ingress must allow that prefix (e.g. `/openclaw` and `/openclaw/*`).

After fixing ingress and container health, reload the UI; chat and other gateway responses should stop returning the Azure 404 page.
