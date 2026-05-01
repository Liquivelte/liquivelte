import { defineConfig } from 'vite';
import { liquivelteVitePlugin } from '../../src/vite/plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  assetsInclude: ['**/*.liquivelte'],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    svelte(),
    liquivelteVitePlugin({
      themeRoot: '.'
    }),
    {
      name: 'copy-shopify-theme-files',
      buildStart() {
        const context = this as any;
        const root = process.cwd();

        const watchDir = (srcDir: string) => {
          if (!existsSync(srcDir)) return;

          const files = readdirSync(srcDir);
          for (const file of files) {
            const srcPath = join(srcDir, file);
            const stat = statSync(srcPath);

            if (stat.isDirectory()) {
              watchDir(srcPath);
            } else if (!file.endsWith('.liquivelte') && !file.endsWith('.css')) {
              context.addWatchFile(srcPath);
            }
          }
        };

        watchDir(join(root, 'layout'));
        watchDir(join(root, 'config'));
        watchDir(join(root, 'locales'));
        watchDir(join(root, 'templates'));
        watchDir(join(root, 'sections'));
        watchDir(join(root, 'snippets'));
        watchDir(join(root, 'blocks'));
        watchDir(join(root, 'src'));
      },
      closeBundle() {
        const root = process.cwd();
        const dist = join(root, 'dist');

        const copyDir = (srcDir: string, destDir: string) => {
          if (!existsSync(srcDir)) return;
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

          const files = readdirSync(srcDir);
          for (const file of files) {
            const srcPath = join(srcDir, file);
            const destPath = join(destDir, file);

            if (file.endsWith('.liquivelte') || file.endsWith('.css')) continue;

            const stat = statSync(srcPath);
            if (stat.isDirectory()) {
              copyDir(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          }
        };

        // Copy Shopify theme directories (excluding CSS which is processed by Vite)
        copyDir(join(root, 'layout'), join(dist, 'layout'));
        copyDir(join(root, 'config'), join(dist, 'config'));
        copyDir(join(root, 'locales'), join(dist, 'locales'));
        copyDir(join(root, 'templates'), join(dist, 'templates'));
        copyDir(join(root, 'sections'), join(dist, 'sections'));
        copyDir(join(root, 'snippets'), join(dist, 'snippets'));
        copyDir(join(root, 'blocks'), join(dist, 'blocks'));

        // Copy compiled CSS to base.css for Shopify
        const assetsDir = join(dist, 'assets');
        if (existsSync(assetsDir)) {
          const files = readdirSync(assetsDir);
          for (const file of files) {
            if (file === 'index.css') {
              const srcPath = join(assetsDir, file);
              const destPath = join(assetsDir, 'base.css');
              copyFileSync(srcPath, destPath);
              break;
            }
          }
        }
      }
    }
  ]
});
