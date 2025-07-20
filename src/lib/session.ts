import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDbUsers, User } from './data';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-for-development';
const key = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = 'session';

export type AuthenticatedUser = Omit<User, 'password'>;

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // 1 day
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        // This will be caught for expired tokens, invalid tokens, etc.
        return null;
    }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
  const session = await encrypt({ userId, expires });

  cookies().set(SESSION_COOKIE_NAME, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function deleteSession() {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0) });
}

export async function getSession() {
    const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!cookie) return null;
    return await decrypt(cookie);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const session = await getSession();
    if (!session?.userId) {
        return null;
    }

    const user = getDbUsers().find(u => u.id === session.userId);

    if (!user) {
        return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export async function protectPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    return user;
}
