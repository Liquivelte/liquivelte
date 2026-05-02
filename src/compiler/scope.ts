import { Document } from './parseDocument.js';
import { Token, LiquidTagToken, ComponentTagToken } from './tokenize.js';

let frameIdCounter = 0;

function generateFrameId(): string {
  return `frame:${frameIdCounter++}`;
}

export interface ScopeVariable {
  name: string;
  kind: string;
}

export interface ScopeFrame {
  id: string;
  type: string;
  variables?: ScopeVariable[];
  item?: string;
  source?: string;
  indexName?: string;
  forloopName?: string;
  parentLoopId?: string;
  module?: string;
  props?: Array<{ name: string; expression: string }>;
  scopePath?: string[];
}

export interface ScopeModel {
  root: {
    type: 'root';
    variables: ScopeVariable[];
  };
  frames: ScopeFrame[];
}

export function buildScopeModel(document: Document): ScopeModel {
  const model: ScopeModel = {
    root: {
      type: 'root',
      variables: []
    },
    frames: []
  };

  const loopStack: ScopeFrame[] = [];

  for (const token of document.tokens) {
    if (token.type === 'LiquidTag') {
      const tag = token as LiquidTagToken;

      if (tag.name === 'for' && tag.item && tag.source) {
        const frameId = generateFrameId();
        const frame: ScopeFrame = {
          id: frameId,
          type: 'for',
          item: tag.item,
          source: tag.source,
          indexName: 'index',
          forloopName: 'forloop',
          variables: [
            { name: tag.item, kind: 'loop-item' },
            { name: 'index', kind: 'loop-index' },
            { name: 'forloop', kind: 'synthetic-forloop' }
          ]
        };

        if (loopStack.length > 0) {
          frame.parentLoopId = loopStack[loopStack.length - 1].id;
        }

        model.frames.push(frame);
        loopStack.push(frame);
      }

      if (tag.name === 'endfor' && loopStack.length > 0) {
        loopStack.pop();
      }

      if (tag.name === 'if' || tag.name === 'elsif' || tag.name === 'else') {
        const frameId = generateFrameId();
        model.frames.push({
          id: frameId,
          type: tag.name === 'if' ? 'if' : 'branch'
        });
      }

      if (tag.name === 'endif') {
        // Branch frame already added
      }
    }

    if (token.type === 'ComponentTag') {
      const component = token as ComponentTagToken;
      const frameId = generateFrameId();
      
      const props: Array<{ name: string; expression: string }> = [];
      for (const [name, value] of Object.entries(component.props)) {
        // Remove {{- and -}} from expression
        const expression = value.replace(/^\{\{-?\s*/, '').replace(/\s*-?\}\}$/, '');
        props.push({ name, expression });
      }

      const scopePath: string[] = [];
      if (loopStack.length > 0) {
        const loopFrame = loopStack[loopStack.length - 1];
        scopePath.push(`for:${loopFrame.id}`);
      } else {
        // Ensure scopePath exists even when not in a loop
        scopePath.push('root');
      }

      // Use component name directly as module name
      const moduleName = component.name;

      model.frames.push({
        id: frameId,
        type: 'component',
        module: moduleName,
        props,
        scopePath
      });
    }
  }

  return model;
}
