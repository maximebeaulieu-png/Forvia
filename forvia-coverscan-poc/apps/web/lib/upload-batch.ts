"use client";

/**
 * Module-scoped hand-off for the multi-file upload demo. The TopHeader stores
 * the selected files' metadata here, navigates to /certificates?batch=1, and
 * the certificates view takes the batch on arrival. Module scope survives SPA
 * navigation; a hard reload empties it, so ?batch=1 without a pending batch is
 * ignored by the view.
 */
export interface BatchFile {
  /** Original file name, e.g. "allianz_cert_2025.pdf". */
  name: string;
  /** File size in bytes. */
  size: number;
}

let pending: BatchFile[] | null = null;

/** Store the metadata of a multi-file selection until the certificates view picks it up. */
export function setBatch(files: BatchFile[]): void {
  pending = files.length > 0 ? files : null;
}

/** Return the pending batch and clear it — null when nothing is pending (e.g. hard reload). */
export function takeBatch(): BatchFile[] | null {
  const files = pending;
  pending = null;
  return files;
}
