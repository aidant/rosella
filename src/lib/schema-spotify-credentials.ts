import { z } from 'zod'

export const SpotifyCredentialsSchema = z.object({
  access_token: z.string(),
  token_type: z.enum(['Bearer']),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
})

export type SpotifyCredentials = z.infer<typeof SpotifyCredentialsSchema>
