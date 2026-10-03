'use server';

import { auth } from '@/lib/auth';

export async function logout() {
    try {
        await auth.api.signOut({
            headers: {
                cookie: (await import('next/headers')).cookies().toString(),
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error during logout:', error);
        return { success: false };
    }
}
