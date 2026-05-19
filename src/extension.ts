import * as vscode from 'vscode';
import { ExecutorServer } from './SocketServer';

let server: ExecutorServer;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('vsexecutor');
    const port = config.get<number>('port') || 8080;

    server = new ExecutorServer();
    server.start(port);

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => server.updateStatusBar()));

    context.subscriptions.push(vscode.commands.registerCommand('vsexecutor.execute', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || server.clients.size === 0) return;

        const code = editor.document.getText();
        const clientEntries = Array.from(server.clients.entries());

        if (clientEntries.length === 1) {
            server.sendToClient(clientEntries[0][0], code);
        } else {
            const items = clientEntries.map(([ws, name]) => ({ label: `$(device-desktop) ${name}`, ws: ws }));
            const selection = await vscode.window.showQuickPick(
                [{ label: "$(zap) All Clients", ws: null }, ...items],
                { placeHolder: "Select target client" }
            );

            if (!selection) return;

            if (selection.ws === null) {
                clientEntries.forEach(([ws]) => server.sendToClient(ws, code));
                server.output.info("[ciri-vs] Executed to all clients");
            } else {
                server.sendToClient(selection.ws, code);
            }
        }
    }));
}

export function deactivate() { server.dispose(); }