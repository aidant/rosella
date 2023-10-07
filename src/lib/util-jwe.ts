import { PRIVATE_JWK } from '$env/static/private'
import { PUBLIC_JWK } from '$env/static/public'
import { CompactEncrypt, compactDecrypt, importJWK } from 'jose'

const public_jwk = JSON.parse(PUBLIC_JWK)
const private_jwk = JSON.parse(PRIVATE_JWK)

export const encrypt = async (payload: Uint8Array): Promise<string> => {
  return await new CompactEncrypt(payload)
    .setProtectedHeader({ alg: public_jwk.alg!, enc: 'A256GCM' })
    .encrypt(await importJWK(public_jwk))
}

export const decrypt = async (jwe: string): Promise<Uint8Array> => {
  const result = await compactDecrypt(jwe, await importJWK(private_jwk))
  return result.plaintext
}
