import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

const getPortalVersion = () => {
  try {
    const count = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    return `${count}-${sha}`
  } catch (error) {
    return `dev-${Date.now()}`
  }
}

const portalVersion = getPortalVersion()

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  define: {
    'import.meta.env.VITE_ADMIN_VERSION': JSON.stringify(portalVersion),
  },
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: 3002
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ifs/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
