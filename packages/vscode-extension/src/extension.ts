import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('Liquivelte');

  const serverOptions: ServerOptions = {
    command: 'node',
    args: [context.asAbsolutePath('../language-server/dist/server.js'), '--stdio'],
    options: {
      cwd: context.asAbsolutePath('..')
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'liquivelte' }
    ],
    outputChannel,
    initializationFailedHandler: (error) => {
      outputChannel.appendLine(`Language server initialization failed: ${error}`);
      vscode.window.showErrorMessage('Liquivelte language server failed to initialize');
      return false;
    }
  };

  client = new LanguageClient(
    'liquivelteLanguageServer',
    'Liquivelte Language Server',
    serverOptions,
    clientOptions
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('liquivelte.restartLanguageServer', async () => {
      if (client) {
        try {
          await client.stop();
        } catch (error) {
          outputChannel.appendLine(`Language server stop failed: ${error}`);
        }
        await client.start();
        vscode.window.showInformationMessage('Liquivelte language server restarted');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('liquivelte.showCompiledLiquid', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'liquivelte') {
        vscode.window.showWarningMessage('Active file is not a Liquivelte file');
        return;
      }

      try {
        const source = document.getText();
        const compilerPath = context.asAbsolutePath('../../src/compiler/compileLiquivelte.js');
        const { compileLiquivelte } = await import(compilerPath);
        const result = compileLiquivelte(source, {
          filename: document.uri.fsPath,
          componentName: 'document',
          mode: 'development',
          svelteVersionTarget: 3,
          trace: { enabled: false, format: 'json-script' },
          themeImportsMode: 'auto'
        });

        const doc = await vscode.workspace.openTextDocument({
          content: result.liquidCode,
          language: 'liquid'
        });
        await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Compilation failed: ${message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('liquivelte.showCompiledSvelte', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'liquivelte') {
        vscode.window.showWarningMessage('Active file is not a Liquivelte file');
        return;
      }

      try {
        const source = document.getText();
        const compilerPath = context.asAbsolutePath('../../src/compiler/compileLiquivelte.js');
        const { compileLiquivelte } = await import(compilerPath);
        const result = compileLiquivelte(source, {
          filename: document.uri.fsPath,
          componentName: 'document',
          mode: 'development',
          svelteVersionTarget: 3,
          trace: { enabled: false, format: 'json-script' },
          themeImportsMode: 'auto'
        });

        const doc = await vscode.workspace.openTextDocument({
          content: result.svelteCode,
          language: 'svelte'
        });
        await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Compilation failed: ${message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('liquivelte.showTracePlan', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'liquivelte') {
        vscode.window.showWarningMessage('Active file is not a Liquivelte file');
        return;
      }

      try {
        const source = document.getText();
        const compilerPath = context.asAbsolutePath('../../src/compiler/compileLiquivelte.js');
        const { compileLiquivelte } = await import(compilerPath);
        const result = compileLiquivelte(source, {
          filename: document.uri.fsPath,
          componentName: 'document',
          mode: 'development',
          svelteVersionTarget: 3,
          trace: { enabled: true, format: 'json-script' },
          themeImportsMode: 'auto'
        });

        const doc = await vscode.workspace.openTextDocument({
          content: JSON.stringify(result.tracePlan, null, 2),
          language: 'json'
        });
        await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Compilation failed: ${message}`);
      }
    })
  );

  client.start();
}

export async function deactivate(): Promise<void> {
  if (!client) {
    return;
  }
  try {
    await client.stop();
  } catch {
    return;
  }
}
