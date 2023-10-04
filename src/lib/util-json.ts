export const encode = <T extends object>(payload: T) =>
  new TextEncoder().encode(JSON.stringify(payload))

export const decode = <T extends object>(payload: Uint8Array): T =>
  JSON.parse(new TextDecoder().decode(payload))
