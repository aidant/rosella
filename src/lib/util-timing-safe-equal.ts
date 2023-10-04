export const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.byteLength !== b.byteLength) {
    return false
  }

  let diff = 0

  for (let index = 0; index < a.byteLength; index++) {
    diff |= a[index] ^ b[index]
  }

  return diff === 0
}
