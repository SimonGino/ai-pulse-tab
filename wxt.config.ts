import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'AI Pulse Tab',
    permissions: ['cookies', 'storage', 'alarms'],
    host_permissions: ['https://claude.ai/*', 'https://chatgpt.com/*'],
  },
});
