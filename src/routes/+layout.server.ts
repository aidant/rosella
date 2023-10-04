import { db } from '$lib/db'
import { session } from '$lib/db-session.schema'
import { user as User } from '$lib/db-user.schema'
import { decode } from '$lib/util-json'
import { decrypt } from '$lib/util-jwe'
import { eq, inArray } from 'drizzle-orm'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url, cookies }) => {
  const cookieSession = cookies.get('rosella.session')

  if (!cookieSession) {
    return
  }

  const { id: sessionId } = decode<{ id: number }>(await decrypt(cookieSession))

  const [user] = await db
    .select()
    .from(User)
    .where(
      inArray(
        User.id,
        db.select({ userId: session.userId }).from(session).where(eq(session.id, sessionId)),
      ),
    )

  return user
}
