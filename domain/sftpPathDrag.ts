import { resolveInteractiveTerminalCdIntent } from "./sessionRestore";

export const SFTP_PATH_DRAG_MIME = "application/x-netcatty-sftp-paths";

export type SftpPathDragPayload = {
  v: 1;
  hostId?: string;
  paths: string[];
};

export function encodeSftpPathDragPayload(hostId: string | undefined, paths: readonly string[]): string {
  return JSON.stringify({ v: 1, ...(hostId ? { hostId } : {}), paths });
}

export function decodeSftpPathDragPayload(raw: string): SftpPathDragPayload | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const payload = value as { v?: unknown; hostId?: unknown; paths?: unknown };
    if (payload.v !== 1 || !Array.isArray(payload.paths)) return null;
    const paths = payload.paths.filter((path): path is string => typeof path === "string" && path.length > 0);
    if (paths.length !== payload.paths.length) return null;
    return {
      v: 1,
      ...(typeof payload.hostId === "string" && payload.hostId ? { hostId: payload.hostId } : {}),
      paths,
    };
  } catch {
    return null;
  }
}

export function quoteShellArgument(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildSftpPathInsertText(paths: readonly string[]): string {
  return `${paths.map(quoteShellArgument).join(" ")} `;
}

export function areSftpDragPathsSafe(paths: readonly string[]): boolean {
  return paths.length > 0 && paths.every((path) => Boolean(resolveInteractiveTerminalCdIntent(path)));
}
