export const encode = (payload: Uint8Array) =>
  btoa(String.fromCharCode(...payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

export const decode = (payload: string): Uint8Array =>
  Uint8Array.from(
    atob((payload + '==='.slice((payload.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/')),
    (c) => c.charCodeAt(0),
  )
