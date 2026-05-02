import { compileLiquivelte, CompileOptions } from '../compiler/compileLiquivelte.js';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';

export interface PluginOptions {
  themeRoot?: string;
}

interface CompileCache {
  [id: string]: {
    svelteCode: string;
    liquidCode: string;
    tracePlan: any;
    componentManifest: any;
  };
}

export function liquivelteVitePlugin(options?: PluginOptions) {
  const cache: CompileCache = {};
  const compiledFiles = new Map<string, any>();

  function compileFile(fullPath: string) {
    const source = readFileSync(fullPath, 'utf-8');
    const filename = fullPath;
    const componentName = filename.split('/').pop()?.replace('.liquivelte', '') || 'Component';

    const compileOptions: CompileOptions = {
      filename,
      componentName,
      mode: 'development',
      svelteVersionTarget: 5,
      trace: { enabled: true, format: 'json-script' },
      themeImportsMode: 'props'
    };

    const result = compileLiquivelte(source, compileOptions);
    compiledFiles.set(fullPath, result);
    return result;
  }

  return {
    name: 'liquivelte-v4',

    async transform(source: string, id: string) {
      if (!id.endsWith('.liquivelte')) {
        return null;
      }

      const filename = id;
      const componentName = filename.split('/').pop()?.replace('.liquivelte', '') || 'Component';
      
      const compileOptions: CompileOptions = {
        filename,
        componentName,
        mode: 'development',
        svelteVersionTarget: 5,
        trace: { enabled: true, format: 'json-script' },
        themeImportsMode: 'props'
      };

      const result = compileLiquivelte(source, compileOptions);
      
      cache[id] = {
        svelteCode: result.svelteCode,
        liquidCode: result.liquidCode,
        tracePlan: result.tracePlan,
        componentManifest: result.componentManifest
      };

      compiledFiles.set(id, result);

      return {
        code: result.svelteCode,
        map: null
      };
    },

    async buildStart() {
      const context = this as any;
      const root = resolve(process.cwd(), options?.themeRoot || '.');
      const sectionsDir = join(root, 'sections');
      const snippetsDir = join(root, 'snippets');
      const blocksDir = join(root, 'blocks');
      
      const scanDir = (dir: string) => {
        if (!existsSync(dir)) return;
        const files = readdirSync(dir);
        for (const file of files) {
          const fullPath = join(dir, file);
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (file.endsWith('.liquivelte')) {
            context.addWatchFile(fullPath);
            compileFile(fullPath);
          }
        }
      };

      scanDir(sectionsDir);
      scanDir(snippetsDir);
      scanDir(blocksDir);
    },

    resolveId(id: string) {
      if (id === 'virtual:liquivelte/runtime') {
        return '\0virtual:liquivelte/runtime';
      }
      if (id === 'virtual:liquivelte/manifest') {
        return '\0virtual:liquivelte/manifest';
      }
      return null;
    },

    load(id: string) {
      if (id === '\0virtual:liquivelte/runtime') {
        return `
export { createForloop } from '../src/runtime/forloop';
export { createTraceStore } from '../src/runtime/trace';
export function contains(value: any, needle: any): boolean {
  if (Array.isArray(value)) {
    return value.includes(needle);
  }
  if (typeof value === 'string') {
    return value.includes(needle);
  }
  return false;
}
export function size(value: any): number {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === 'string') {
    return value.length;
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).length;
  }
  return 0;
}
export function expr(frame: any, id: string, fallback: () => any): any {
  return fallback();
}
`;
      }
      
      if (id === '\0virtual:liquivelte/manifest') {
        const manifestEntries: any[] = [];
        for (const [id, result] of compiledFiles) {
          manifestEntries.push({
            filename: id,
            components: result.componentManifest.components,
            themeImports: result.componentManifest.themeImports
          });
        }
        return `export const manifest = ${JSON.stringify(manifestEntries, null, 2)};`;
      }

      return null;
    },

    generateBundle(_options: any, _bundle: any) {
      const context = this as any;
      
      function liquidOutputPath(id: string): string {
        const marker = '/sections/';
        if (id.includes(marker)) {
          return `sections/${id.split(marker)[1].replace(/\.liquivelte$/, '.liquid')}`;
        }

        const snippetMarker = '/snippets/';
        if (id.includes(snippetMarker)) {
          return `snippets/${id.split(snippetMarker)[1].replace(/\.liquivelte$/, '.liquid')}`;
        }

        const blocksMarker = '/blocks/';
        if (id.includes(blocksMarker)) {
          return `blocks/${id.split(blocksMarker)[1].replace(/\.liquivelte$/, '.liquid')}`;
        }

        return id.split('/').pop()!.replace(/\.liquivelte$/, '.liquid');
      }
      
      for (const [id, result] of compiledFiles) {
        const outputPath = liquidOutputPath(id);
        
        context.emitFile({
          type: 'asset',
          fileName: outputPath,
          source: result.liquidCode
        });
      }
    },

    getCompiled(id: string) {
      return compiledFiles.get(id);
    }
  };
}
