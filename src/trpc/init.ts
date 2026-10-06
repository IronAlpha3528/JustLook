import { db } from '@/db';
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';
import { ratelimit } from '@/lib/ratelimit';

/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // const user = await auth(opts.headers);
  const { userId } = await auth()
  return { clerkUserId: userId };
};


export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: SuperJSON,
  });

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;




export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1)

    if(!user){
      throw new TRPCError({code: "UNAUTHORIZED"})
    }
    
    const {success} = await ratelimit.limit(user.id)

    if(!success){
      throw new TRPCError({code: "TOO_MANY_REQUESTS"})
    }

  return opts.next({
    ctx: {
      ...ctx,
      user
    }
  })
})