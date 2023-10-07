import { db } from '$lib/db'
import { SessionSchema } from '$lib/db-session.schema'
import { decrypt } from '$lib/util-jwe'
import { eq } from 'drizzle-orm'
import { stringify } from 'uuid'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies }) => {
  const cookieSession = cookies.get('rosella.session')

  if (!cookieSession) {
    return
  }

  const sessionId = stringify(await decrypt(cookieSession))

  const [session] = await db.select().from(SessionSchema).where(eq(SessionSchema.id, sessionId))

  return {
    id: session?.id,
  }
}
