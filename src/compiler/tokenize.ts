export interface TokenizeOptions {
  componentNames?: string[];
}

export interface Token {
  type: string;
  [key: string]: any;
}

export interface LiquidOutputToken extends Token {
  type: 'LiquidOutput';
  expression: string;
  trimLeft: boolean;
  trimRight: boolean;
}

export interface LiquidTagToken extends Token {
  type: 'LiquidTag';
  name: string;
  item?: string;
  source?: string;
  trimLeft?: boolean;
  trimRight?: boolean;
}

export interface SchemaBlockToken extends Token {
  type: 'SchemaBlock';
  content: string;
  preserveInLiquid: boolean;
  excludeFromSvelte: boolean;
}

export interface ComponentTagToken extends Token {
  type: 'ComponentTag';
  name: string;
  selfClosing: boolean;
  props: Record<string, string>;
  children?: string;
}

export interface HtmlToken extends Token {
  type: 'Html';
  content: string;
}

export interface ScriptToken extends Token {
  type: 'Script';
  content: string;
}

let frameIdCounter = 0;

function generateFrameId(): string {
  return `frame:${frameIdCounter++}`;
}

export function tokenize(source: string, options?: TokenizeOptions): Token[] {
  const tokens: Token[] = [];
  const componentNames = options?.componentNames || [];
  let pos = 0;

  scan: while (pos < source.length) {
    // Check for Liquid output {{ ... }}
    const outputMatch = source.slice(pos).match(/^(\{\{-?\s*)(.+?)(\s*-?\}\})/s);
    if (outputMatch) {
      const [full, open, expression, close] = outputMatch;
      tokens.push({
        type: 'LiquidOutput',
        expression: expression.trim(),
        trimLeft: open.includes('-'),
        trimRight: close.includes('-')
      });
      pos += full.length;
      continue;
    }

    // Check for schema blocks {% schema %}...{% endschema %} BEFORE generic Liquid tags
    const schemaStartMatch = source.slice(pos).match(/^\{%\s*schema\s*%\}/);
    if (schemaStartMatch) {
      const afterSchemaStart = pos + schemaStartMatch[0].length;
      const schemaEndMatch = source.slice(afterSchemaStart).match(/\{%\s*endschema\s*%\}/);
      if (schemaEndMatch && schemaEndMatch.index !== undefined) {
        const content = source.slice(afterSchemaStart, afterSchemaStart + schemaEndMatch.index);
        tokens.push({
          type: 'SchemaBlock',
          content,
          preserveInLiquid: true,
          excludeFromSvelte: true
        });
        pos = afterSchemaStart + schemaEndMatch.index + schemaEndMatch[0].length;
        continue scan;
      }
    }

    // Check for Liquid tags {% ... %}
    const tagMatch = source.slice(pos).match(/^(\{%\s*)(\w+)(?:\s+([^%]*?))?(\s*%\})/s);
    if (tagMatch) {
      const [full, open, name, args, close] = tagMatch;
      const tagToken: LiquidTagToken = {
        type: 'LiquidTag',
        name,
        trimLeft: open.includes('-'),
        trimRight: close.includes('-')
      };

      // Parse for tag
      if (name === 'for' && args) {
        const forMatch = args.match(/(\w+)\s+in\s+(.+)/);
        if (forMatch) {
          tagToken.item = forMatch[1];
          tagToken.source = forMatch[2].trim();
        }
      }

      // Parse if/elsif tags - store source
      if ((name === 'if' || name === 'elsif') && args) {
        tagToken.source = args.trim();
      }

      tokens.push(tagToken);
      pos += full.length;
      continue scan;
    }


    // Check for component tags
    if (componentNames.length > 0) {
      for (const componentName of componentNames) {
        // Match opening tag with optional attributes and self-closing
        const componentOpenMatch = source.slice(pos).match(new RegExp(`^<${componentName}[^>]*>`));
        if (componentOpenMatch) {
          const full = componentOpenMatch[0];
          const selfClosing = full.includes('/>');
          
          // Parse props
          const props: Record<string, string> = {};
          const attrsMatch = full.match(new RegExp(`<${componentName}(\\s[^>]*)`));
          if (attrsMatch) {
            const attrMatches = attrsMatch[1].matchAll(/(\w+)=["']([^"']*)["']/g);
            for (const match of attrMatches) {
              props[match[1]] = match[2];
            }
          }

          // Find children if not self-closing - use absolute offsets
          let children: string | undefined;
          if (!selfClosing) {
            const afterOpen = pos + full.length;
            const componentCloseMatch = source.slice(afterOpen).match(new RegExp(`</${componentName}>`));
            if (componentCloseMatch && componentCloseMatch.index !== undefined) {
              children = source.slice(afterOpen, afterOpen + componentCloseMatch.index);
              pos = afterOpen + componentCloseMatch.index + componentCloseMatch[0].length;
            } else {
              pos += full.length;
            }
          } else {
            pos += full.length;
          }

          tokens.push({
            type: 'ComponentTag',
            name: componentName,
            selfClosing,
            props,
            children
          });

          continue scan;
        }
      }
    }

    // Check for script tags
    const scriptMatch = source.slice(pos).match(/^<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      tokens.push({
        type: 'Script',
        content: scriptMatch[1]
      });
      pos += scriptMatch[0].length;
      continue;
    }

    // Default to HTML content
    const nextLiquid = source.slice(pos).search(/\{[{%]/);
    const nextComponent = componentNames.length > 0 
      ? componentNames.map(c => source.slice(pos).indexOf(`<${c}`)).filter(i => i >= 0).sort((a, b) => a - b)[0]
      : -1;
    const nextScript = source.slice(pos).indexOf('<script>');
    
    let nextSpecial = -1;
    if (nextLiquid >= 0) nextSpecial = nextLiquid;
    if (nextComponent >= 0 && (nextSpecial < 0 || nextComponent < nextSpecial)) nextSpecial = nextComponent;
    if (nextScript >= 0 && (nextSpecial < 0 || nextScript < nextSpecial)) nextSpecial = nextScript;

    if (nextSpecial >= 0) {
      if (nextSpecial > 0) {
        tokens.push({
          type: 'Html',
          content: source.slice(pos, pos + nextSpecial)
        });
        pos += nextSpecial;
      } else {
        // Fallback: consume one character to prevent infinite loop
        tokens.push({
          type: 'Html',
          content: source[pos]
        });
        pos += 1;
      }
    } else {
      tokens.push({
        type: 'Html',
        content: source.slice(pos)
      });
      pos = source.length;
    }
  }

  return tokens;
}
