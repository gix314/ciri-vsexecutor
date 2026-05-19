"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorServer = void 0;
const vscode = require("vscode");
const ws_1 = require("ws");
class ExecutorServer {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.output = vscode.window.createOutputChannel("ciri-vs", { log: true });
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    updateStatusBar() {
        const editor = vscode.window.activeTextEditor;
        const isLuau = editor?.document.languageId === 'lua' || editor?.document.fileName.endsWith('.lua') || editor?.document.fileName.endsWith('.luau');
        const count = this.clients.size;
        if (!isLuau) {
            this.statusBarItem.text = "$(file-code) Lua Only";
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.command = undefined;
        }
        else if (count === 0) {
            this.statusBarItem.text = "$(circle-slash) No Clients";
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            this.statusBarItem.command = undefined;
        }
        else {
            this.statusBarItem.text = `$(play) Execute (${count} Client${count > 1 ? 's' : ''})`;
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.command = 'vsexecutor.execute';
        }
    }
    start(port) {
        if (this.wss)
            this.wss.close();
        this.wss = new ws_1.WebSocketServer({ port });
        this.wss.on('connection', (ws) => {
            const heartbeat = setInterval(() => {
                if (ws.readyState === ws.OPEN)
                    ws.send(JSON.stringify({ type: 'PING' }));
            }, 10000);
            ws.on('message', (rawData) => {
                try {
                    const data = rawData.toString();
                    const packet = JSON.parse(data);
                    if (packet.type === 'HANDSHAKE') {
                        this.clients.set(ws, packet.name);
                        this.output.info(`[SYSTEM] Connected: ${packet.name}`);
                        this.updateStatusBar();
                    }
                    if (packet.type === 'LOG') {
                        const name = this.clients.get(ws) || "Game";
                        const msg = `[${name}] ${packet.message}`;
                        if (packet.logType === 'MessageError') {
                            this.output.error(msg);
                        }
                        else if (packet.logType === 'MessageWarning') {
                            this.output.warn(msg);
                        }
                        else if (packet.logType === 'MessageInfo') {
                            this.output.info(msg);
                        }
                        else {
                            this.output.appendLine(msg);
                        }
                    }
                }
                catch (e) {
                    this.output.error(`[SYSTEM] Failed to process packet: ${e}`);
                }
            });
            ws.on('close', () => {
                clearInterval(heartbeat);
                const name = this.clients.get(ws);
                this.clients.delete(ws);
                this.output.info(`[SYSTEM] Disconnected: ${name}`);
                this.updateStatusBar();
            });
        });
        this.output.info(`[SYSTEM] Server online on port ${port}`);
    }
    sendToClient(ws, code) {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'DATA', data: code }));
            const name = this.clients.get(ws) || "Unknown";
            this.output.appendLine(`[ciri-vs] Executed -> ${name}`);
        }
    }
    dispose() {
        this.wss?.close();
        this.statusBarItem.dispose();
    }
}
exports.ExecutorServer = ExecutorServer;
//# sourceMappingURL=SocketServer.js.map