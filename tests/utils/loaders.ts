export async function loadCompilerModule() {
  const path = '../../src/compiler/compileLiquivelte';
  return import(path);
}

export async function loadTokenizerModule() {
  const path = '../../src/compiler/tokenize';
  return import(path);
}

export async function loadParserModule() {
  const path = '../../src/compiler/parseDocument';
  return import(path);
}

export async function loadScopeModule() {
  const path = '../../src/compiler/scope';
  return import(path);
}

export async function loadExpressionModule() {
  const path = '../../src/compiler/expressions';
  return import(path);
}

export async function loadRuntimeForloopModule() {
  const path = '../../src/runtime/forloop';
  return import(path);
}

export async function loadRuntimeTraceModule() {
  const path = '../../src/runtime/trace';
  return import(path);
}

export async function loadVitePluginModule() {
  const path = '../../src/vite/plugin';
  return import(path);
}
