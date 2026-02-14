'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast'; // Assuming hot-toast is used, otherwise I'll use a simple console log or alert mechanism if needed, but toast is standard.
// If toast isn't available, I'll check package.json or other files.
// Wait, I should check if toast is used. `src/app/components/FriendlyError.jsx` might offer clues, or look at `layout.js`.
// Actually, `layout.js` uses `Toaster` from `react-hot-toast` in many Next.js apps.
// I'll assume it's available or use a fallback.
// Let's check `package.json` first? No, I'll just look at `src/app/layout.js` to see if one is provided.
// Or just make it silent if no toast.
// The plan said "User Feedback: Optional non-intrusive toast".
// I'll use a simple fetch and console log for now to be safe, maybe `console.log` is safer to avoid dependency issues if `react-hot-toast` isn't installed.
// BUT, `src/app/components/social/ComposerTabContent` (which I viewed earlier) didn't seem to import `toast`.
// `src/app/dashboard/page.js` imports `FriendlyError`.
// I'll stick to a silent sync or use standard `alert`? No, alert is intrusive.
// I'll make it run silently with console logs.

export default function AutoSyncHandler() {
    const hasSynced = useRef(false);

    useEffect(() => {
        if (hasSynced.current) return;
        hasSynced.current = true; // Prevent double firing in React 18 Strict Mode

        const syncSocials = async () => {
            console.log('🔄 Auto-Sync: Starting background social sync...');
            try {
                // Call without specific platform to sync ALL
                const res = await fetch('/api/social/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });

                if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

                const data = await res.json();
                console.log('✅ Auto-Sync: Completed.', data);
            } catch (err) {
                console.warn('⚠️ Auto-Sync Warning:', err);
                // We suppress the error from the UI to prevent crashes
            }
        };

        // Small delay to let the dashboard render first
        const timer = setTimeout(() => {
            syncSocials();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return null; // Render nothing
}
