import { createClient } from '@blinkdotnew/sdk';

/**
 * Blink SDK Client Initialization
 * Using managed auth mode for easy setup with Blink.
 */
export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'coding-assistant-app-aq878gqr',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' },
});
