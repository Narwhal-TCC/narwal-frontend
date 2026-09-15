export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const INVALID_TYPE_MESSAGE =
  'Selecione um arquivo PNG ou JPEG.'
export const FILE_TOO_LARGE_MESSAGE =
  'O arquivo deve ter no máximo 10 MB.'

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg'])

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return INVALID_TYPE_MESSAGE
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return FILE_TOO_LARGE_MESSAGE
  }
  return null
}
