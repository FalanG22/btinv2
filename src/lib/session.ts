'use server';

import 'server-only';
import { getDbUsers, User } from './data';

export type AuthenticatedUser = Omit<User, 'password'>;

// This is a simplified, mocked session management for demonstration.
// In a real application, you would use a secure session mechanism.

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    // We will always return the default admin user to simulate a logged-in state.
    const user = getDbUsers().find(u => u.id === 'user-admin');

    if (!user) {
        // This should not happen with mock data, but it's good practice.
        return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
