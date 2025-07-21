'use server';

import 'server-only';
import { query } from './db';
import type { User } from './data';
import type { RowDataPacket } from 'mysql2';

export type AuthenticatedUser = Omit<User, 'password'>;

// This is a simplified, mocked session management for demonstration.
// In a real application, you would use a secure session mechanism.

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    // We will always return the default admin user to simulate a logged-in state.
    const [user] = await query<User[] & RowDataPacket[]>(
      "SELECT id, name, email, role, companyId, createdAt FROM users WHERE id = 'user-admin'"
    );

    if (!user) {
        return null;
    }
    
    return user;
}
