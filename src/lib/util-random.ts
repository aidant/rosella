export const random = (length = 48) => crypto.getRandomValues(new Uint8Array(length))
