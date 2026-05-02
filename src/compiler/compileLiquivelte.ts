import { tokenize } from './tokenize.js';
import { parseDocument } from './parseDocument.js';
import { buildScopeModel } from './scope.js';
import { compileLiquidExpression } from './expressions.js';

export interface CompileOptions {
  filename: string;
  componentName: string;
  mode: 'development' | 'production' | 'test';
  svelteVersionTarget: number;
  trace: {
    enabled: boolean;
    format: 'json-script' | 'dom-local';
  };
  themeImportsMode: string;
}

export interface CompileResult {
  svelteCode: string;
  liquidCode: string;
  tracePlan: {
    frames: any[];
    expressionCaptures: any[];
  };
  componentManifest: {
    components: any[];
    themeImports: any[];
  };
  diagnostics: any[];
  map?: unknown;
}

function compileComponentPropAttribute(propName: string, propValue: string): string {
  const liquidOutputMatch = propValue.match(/^\s*\{\{-?\s*([\s\S]*?)\s*-?\}\}\s*$/);

  if (liquidOutputMatch) {
    return ` ${propName}={${liquidOutputMatch[1].trim()}}`;
  }

  return ` ${propName}={${JSON.stringify(propValue)}}`;
}

export function compileLiquivelte(source: string, options: CompileOptions): CompileResult {
  // Reset counters per compile for deterministic output
  let exprIdCounter = 0;
  let frameIdCounter = 0;

  const generateExprId = () => `expr_${exprIdCounter++}`;
  const generateFrameId = () => `frame:${frameIdCounter++}`;
  const tokens = tokenize(source, { componentNames: ['ImageWithCard'] });
  const document = parseDocument(tokens, { componentNames: ['ImageWithCard'] });
  const scopeModel = buildScopeModel(document);

  // Extract script imports
  const scriptToken = tokens.find(t => t.type === 'Script') as any;
  let scriptContent = scriptToken?.content || '';

  // Parse theme imports from script
  const themeImports: any[] = [];
  const componentImports: any[] = [];
  const diagnostics: any[] = [];
  
  // Check for dynamic imports
  if (scriptContent.includes('import(')) {
    diagnostics.push({
      code: 'unsupported-dynamic-theme-import',
      severity: 'error'
    });
  }
  
  const themeImportRegex = /import\s+(\S+)\s+from\s+['"]theme['"]/g;
  const seenImports = new Set<string>();
  
  let match;
  while ((match = themeImportRegex.exec(scriptContent)) !== null) {
    const importPath = match[1];
    // Deduplicate
    if (seenImports.has(importPath)) continue;
    seenImports.add(importPath);
    
    const propName = importPath.includes('.') ? importPath.replace(/\./g, '$$$$') : importPath;
    themeImports.push({ importPath, propName });
  }

  const componentImportRegex = /import\s+(\w+)\s+from\s+['"](\.\/[^'"]+)['"]/g;
  while ((match = componentImportRegex.exec(scriptContent)) !== null) {
    const localName = match[1];
    const source = match[2];
    // Use basename logic: extract just the filename without path
    const module = source.split('/').pop()!.replace(/\.liquivelte$/, '');
    componentImports.push({ localName, source, module });
  }

  // Generate Svelte code
  let svelteCode = '';
  
  // Add script section with exports
  if (themeImports.length > 0 || componentImports.length > 0) {
    svelteCode += '<script>\n';
    
    // Add component imports
    for (const imp of componentImports) {
      svelteCode += `  import ${imp.localName} from '${imp.source}';\n`;
    }
    
    // Add theme imports as props
    for (const imp of themeImports) {
      if (imp.importPath.includes('.')) {
        // Subpath import
        svelteCode += `  export let ${imp.propName};\n`;
        const [obj, prop] = imp.importPath.split('.');
        svelteCode += `  ${obj}.${prop} = ${imp.propName};\n`;
      } else {
        svelteCode += `  export let ${imp.importPath};\n`;
      }
    }
    
    svelteCode += '</script>\n\n';
  }

  // Add runtime import
  svelteCode += '<script>\n';
  svelteCode += "  import { createForloop, contains, size, expr } from 'virtual:liquivelte/runtime';\n";
  svelteCode += '  const lv = { forloop: createForloop, contains, size, expr };\n';
  svelteCode += '</script>\n\n';

  // Process tokens to generate body
  let loopDepth = 0;
  const loopStack: any[] = [];
  const expressionCaptures: any[] = [];
  const traceFrames: any[] = [];

  for (const token of tokens) {
    if (token.type === 'Html') {
      svelteCode += token.content;
    } else if (token.type === 'LiquidTag') {
      const tag = token as any;
      
      if (tag.name === 'for' && tag.item && tag.source) {
        const frameId = generateFrameId();
        loopDepth++;
        svelteCode += `{#each ${tag.source} as ${tag.item}, index}`;
        svelteCode += `  {@const forloop = lv.forloop(index, lv.size(${tag.source}))}`;
        
        traceFrames.push({
          id: frameId,
          type: 'for',
          item: tag.item,
          source: tag.source
        });
        
        loopStack.push({ frameId, item: tag.item, source: tag.source });
      } else if (tag.name === 'endfor') {
        loopDepth--;
        loopStack.pop();
        svelteCode += '{/each}';
      } else if (tag.name === 'if') {
        // Transform condition
        const condition = tag.source || '';
        const compiled = compileLiquidExpression(condition);
        svelteCode += `{#if ${compiled.code}}`;
      } else if (tag.name === 'elsif') {
        const condition = tag.source || '';
        const compiled = compileLiquidExpression(condition);
        svelteCode += `{:else if ${compiled.code}}`;
      } else if (tag.name === 'else') {
        svelteCode += '{:else}';
      } else if (tag.name === 'endif') {
        svelteCode += '{/if}';
      }
    } else if (token.type === 'LiquidOutput') {
      const output = token as any;
      const compiled = compileLiquidExpression(output.expression);
      
      if (compiled.traceCapture) {
        const exprId = generateExprId();
        expressionCaptures.push({
          id: exprId,
          expression: compiled.traceCapture.expression,
          reason: compiled.traceCapture.reason
        });
        svelteCode += `{${compiled.code.replace('expr_', exprId).replace('frame', 'undefined')}}`;
      } else {
        svelteCode += `{${compiled.code}}`;
      }
    } else if (token.type === 'ComponentTag') {
      const component = token as any;
      const frameId = generateFrameId();
      
      // Extract module name
      const moduleName = component.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      
      traceFrames.push({
        id: frameId,
        type: 'component',
        module: moduleName
      });

      // Handle slots - inspect slot="eyebrow" elements
      if (component.children) {
        const slots: any[] = [];
        
        // Look for elements with slot="eyebrow"
        const eyebrowMatch = component.children.match(/<[^>]+slot=["']eyebrow["'][^>]*>([\s\S]*?)<\/[^>]+>/);
        if (eyebrowMatch) {
          slots.push({ name: 'eyebrow', content: eyebrowMatch[1] });
        }
        
        // Find default slot content (non-slotted content)
        const defaultSlotContent = component.children
          .replace(/<[^>]+slot=["'][^"']+['"][^>]*>[\s\S]*?<\/[^>]+>/g, '')
          .replace(/<slot[^>]*\/>/g, '')
          .trim();

        if (defaultSlotContent) {
          slots.push({ name: 'default', content: defaultSlotContent });
        }
        
        if (slots.length > 0) {
          traceFrames[traceFrames.length - 1].slots = slots;
        }
      }

      // Generate Svelte component tag
      svelteCode += `<${component.name}`;
      for (const [propName, propValue] of Object.entries(component.props)) {
        svelteCode += compileComponentPropAttribute(propName, propValue as string);
      }
      
      if (component.selfClosing) {
        svelteCode += ' />';
      } else {
        svelteCode += '>';
        if (component.children) {
          // Transform children
          const transformedChildren = component.children
            .replace(/\{\{-?\s*([^}]+)\s*-?\}\}/g, (match: string, expr: string) => {
              const compiled = compileLiquidExpression(expr);
              if (compiled.traceCapture) {
                const exprId = generateExprId();
                expressionCaptures.push({
                  id: exprId,
                  expression: compiled.traceCapture.expression,
                  reason: compiled.traceCapture.reason
                });
                return `{${compiled.code.replace('expr_', exprId).replace('frame', 'undefined')}}`;
              }
              return `{${compiled.code}}`;
            });
          svelteCode += transformedChildren;
        }
        svelteCode += `</${component.name}>`;
      }
    } else if (token.type === 'SchemaBlock') {
      // Skip schema in Svelte output
    }
  }

  // Generate Liquid code
  let liquidCode = '';
  
  // Add script comment for Liquid
  if (scriptContent) {
    liquidCode += '{% comment %} Script: ' + scriptContent.replace(/\n/g, ' ') + ' {% endcomment %}\n';
  }

  // Process tokens for Liquid output
  for (const token of tokens) {
    if (token.type === 'Html') {
      liquidCode += token.content;
    } else if (token.type === 'LiquidTag') {
      const tag = token as any;
      liquidCode += `{% ${tag.name}`;
      if (tag.item && tag.source) {
        liquidCode += ` ${tag.item} in ${tag.source}`;
      } else if (tag.source) {
        liquidCode += ` ${tag.source}`;
      } else if (tag.args) {
        // For render, assign, and other tags with arguments
        liquidCode += ` ${tag.args}`;
      }
      liquidCode += ' %}';
    } else if (token.type === 'LiquidOutput') {
      const output = token as any;
      liquidCode += `{{${output.expression}}}`;
    } else if (token.type === 'ComponentTag') {
      const component = token as any;
      const moduleName = component.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      
      // Find the corresponding frame to get trace_id
      const frame = traceFrames.find((f: any) => f.type === 'component' && f.module === moduleName);
      const traceId = frame ? frame.id : 'unknown';
      
      liquidCode += `{% render 'liquivelte-component', module: '${moduleName}', trace_id: '${traceId}' %}`;
    } else if (token.type === 'SchemaBlock') {
      liquidCode += `{% schema %}${token.content}{% endschema %}`;
    }
  }

  // Add trace script if enabled
  if (options.trace.enabled && options.trace.format === 'json-script') {
    liquidCode += `\n<script type="application/json" data-liquivelte-trace>`;
    liquidCode += JSON.stringify({ frames: traceFrames, expressionCaptures }, null, 2);
    liquidCode += '</script>';
  }

  return {
    svelteCode,
    liquidCode,
    tracePlan: {
      frames: traceFrames,
      expressionCaptures
    },
    componentManifest: {
      components: componentImports,
      themeImports
    },
    diagnostics
  };
}
