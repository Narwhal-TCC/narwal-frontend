let pendingFile: File | null = null

export function setPendingUploadFile(file: File): void {
  pendingFile = file
}

export function getPendingUploadFile(): File | null {
  return pendingFile
}

export function clearPendingUploadFile(): void {
  pendingFile = null
}
