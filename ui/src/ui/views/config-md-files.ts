import { html, nothing } from "lit";
import { formatRelativeTimestamp } from "../format.ts";
import type { AgentFileEntry, AgentsFilesListResult } from "../types.ts";
import { formatBytes } from "./agents-utils.ts";

function isMdFile(name: string): boolean {
  return name.toLowerCase().endsWith(".md");
}

function renderFileRow(file: AgentFileEntry, active: string | null, onSelect: () => void) {
  const status = file.missing
    ? "Missing"
    : `${formatBytes(file.size)} · ${formatRelativeTimestamp(file.updatedAtMs ?? null)}`;
  return html`
    <button
      type="button"
      class="agent-file-row ${active === file.name ? "active" : ""}"
      @click=${onSelect}
    >
      <div>
        <div class="agent-file-name mono">${file.name}</div>
        <div class="agent-file-meta">${status}</div>
      </div>
      ${
        file.missing
          ? html`<span class="agent-pill warn">missing</span>`
          : nothing
      }
    </button>
  `;
}

export type ConfigMdFilesProps = {
  defaultAgentId: string | null;
  agentFilesList: AgentsFilesListResult | null;
  agentFilesLoading: boolean;
  agentFilesError: string | null;
  agentFileActive: string | null;
  agentFileContents: Record<string, string>;
  agentFileDrafts: Record<string, string>;
  agentFileSaving: boolean;
  onLoadFiles: (agentId: string) => void;
  onSelectFile: (name: string) => void;
  onFileDraftChange: (name: string, content: string) => void;
  onFileReset: (name: string) => void;
  onFileSave: (name: string) => void;
};

export function renderConfigMdFiles(props: ConfigMdFilesProps) {
  const list =
    props.defaultAgentId && props.agentFilesList?.agentId === props.defaultAgentId
      ? props.agentFilesList
      : null;
  const allFiles = list?.files ?? [];
  const mdFiles = allFiles.filter((f) => isMdFile(f.name));
  const active = props.agentFileActive ?? null;
  const activeEntry = active ? mdFiles.find((f) => f.name === active) ?? null : null;
  const baseContent = active ? (props.agentFileContents[active] ?? "") : "";
  const draft = active ? (props.agentFileDrafts[active] ?? baseContent) : "";
  const isDirty = active ? draft !== baseContent : false;

  return html`
    <div class="config-md-files">
      <div class="config-md-files__header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
        <div>
          <h2 class="config-md-files__title">Agent .md Files</h2>
          <p class="config-md-files__sub">Edit markdown files used by the agent (persona, tools, identity).</p>
        </div>
        ${props.defaultAgentId
          ? html`
              <button
                class="btn btn--sm"
                ?disabled=${props.agentFilesLoading}
                @click=${() => props.onLoadFiles(props.defaultAgentId!)}
              >
                ${props.agentFilesLoading ? "Loading…" : "Refresh"}
              </button>
            `
          : nothing}
      </div>

      ${props.agentFilesError
        ? html`<div class="callout danger" style="margin-top: 12px;">${props.agentFilesError}</div>`
        : nothing}

      ${!props.defaultAgentId
        ? html`
            <div class="callout info" style="margin-top: 16px;">
              No default agent. Connect to the gateway and ensure at least one agent is configured.
            </div>
          `
        : !list
          ? html`
              <div class="callout info" style="margin-top: 16px;">
                Click Refresh to load the list of .md files from the agent workspace.
              </div>
            `
          : html`
              ${list ? html`<div class="muted mono" style="margin-top: 8px;">Workspace: ${list.workspace}</div>` : nothing}
              <div class="agent-files-grid" style="margin-top: 16px;">
                <div class="agent-files-list">
                  ${mdFiles.length === 0
                    ? html`<div class="muted">No .md files in this workspace.</div>`
                    : mdFiles.map((file) =>
                        renderFileRow(file, active, () => props.onSelectFile(file.name)),
                      )}
                </div>
                <div class="agent-files-editor">
                  ${!activeEntry
                    ? html`<div class="muted">Select a file to edit.</div>`
                    : html`
                        <div class="agent-file-header">
                          <div>
                            <div class="agent-file-title mono">${activeEntry.name}</div>
                            <div class="agent-file-sub mono">${activeEntry.path}</div>
                          </div>
                          <div class="agent-file-actions">
                            <button
                              class="btn btn--sm"
                              ?disabled=${!isDirty}
                              @click=${() => props.onFileReset(activeEntry.name)}
                            >
                              Reset
                            </button>
                            <button
                              class="btn btn--sm primary"
                              ?disabled=${props.agentFileSaving || !isDirty}
                              @click=${() => props.onFileSave(activeEntry.name)}
                            >
                              ${props.agentFileSaving ? "Saving…" : "Save"}
                            </button>
                          </div>
                        </div>
                        ${activeEntry.missing
                          ? html`
                              <div class="callout info" style="margin-top: 10px;">
                                This file is missing. Saving will create it in the agent workspace.
                              </div>
                            `
                          : nothing}
                        <label class="field" style="margin-top: 12px;">
                          <span>Content</span>
                          <textarea
                            class="config-md-files__textarea"
                            style="min-height: 360px;"
                            .value=${draft}
                            @input=${(e: Event) =>
                              props.onFileDraftChange(
                                activeEntry.name,
                                (e.target as HTMLTextAreaElement).value,
                              )}
                          ></textarea>
                        </label>
                      `}
                </div>
              </div>
            `}
    </div>
  `;
}
