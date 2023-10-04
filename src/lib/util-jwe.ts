import { PRIVATE_JWK } from '$env/static/private'
import { CompactEncrypt, compactDecrypt, importJWK, type JWK } from 'jose'

const JWK = JSON.parse(PRIVATE_JWK)

export const encrypt = async (payload: Uint8Array): Promise<string> => {
  return await new CompactEncrypt(payload)
    .setProtectedHeader({ alg: JWK.alg!, enc: 'A256GCM' })
    .encrypt(await importJWK(JWK))
}

export const decrypt = async (jwe: string): Promise<Uint8Array> => {
  const result = await compactDecrypt(jwe, await importJWK(JWK))
  return result.plaintext
}
