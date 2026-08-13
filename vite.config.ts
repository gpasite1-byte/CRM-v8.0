import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Ensure public/videos exist and sync videos from root /videos directory
const rootVideosDir = path.resolve(__dirname, 'videos');
const publicVideosDir = path.resolve(__dirname, 'public', 'videos');
if (!fs.existsSync(publicVideosDir)) {
  fs.mkdirSync(publicVideosDir, { recursive: true });
}
if (fs.existsSync(rootVideosDir)) {
  try {
    const files = fs.readdirSync(rootVideosDir);
    for (const file of files) {
      const srcFile = path.join(rootVideosDir, file);
      const destFile = path.join(publicVideosDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  } catch (err) {
    console.warn('Could not sync videos directory:', err);
  }
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable HMR auto-reloads to prevent page flickering and auto-refreshes while user is typing
      hmr: false,
      strictPort: false,
    },
  };
});

