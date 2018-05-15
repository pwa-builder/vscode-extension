'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const imageGenerator_1 = require("./modules/imageGenerator");
const appPackaging_1 = require("./modules/appPackaging");
const executeProject_1 = require("./modules/executeProject");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "PWA-Builder" is now active!');
    let inputBox = vscode.commands.registerCommand('extension.imageGenerator', () => {
        imageGenerator_1.imageGeneratorProcess();
    });
    let appxPackage = vscode.commands.registerCommand('extension.appxPackage', () => {
        appPackaging_1.appPackageProcess();
    });
    // --------------------- EXECUTE PROJECT ---------------------------
    let executeProject = vscode.commands.registerCommand('extension.executeProject', () => {
        executeProject_1.executeProjectProcess();
    });
    // -------------------- END EXECUTE PROJECT -------------------------
    context.subscriptions.push(inputBox, appxPackage, executeProject);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map