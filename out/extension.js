'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// Node Lib
const os = require("os");
const exec = require('child_process').exec;
const Filehound = require('filehound');
const imageGenerator_1 = require("./modules/imageGenerator");
const appPackaging_1 = require("./modules/appPackaging");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "PWA-Builder" is now active!');
    // ------------  IMAGE GENERATOR ---------------------------
    let inputBox = vscode.commands.registerCommand('extension.imageGenerator', () => {
        imageGenerator_1.imageGeneratorProcess();
    });
    // -------------------- END IMAGE GENERATOR -------------------------------------
    // ------------------------- APPX PACKAGE ------------------------------------
    let appxPackage = vscode.commands.registerCommand('extension.appxPackage', () => {
        appPackaging_1.appPackageProcess();
    });
    // -------------------- END APPX PACKAGE ----------------------------
    // --------------------- EXECUTE PROJECT ---------------------------
    let executeProject = vscode.commands.registerCommand('extension.executeProject', () => {
        console.log("executeProject");
        try {
            // The manifest must be a xml file.
            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Select APPX Package",
            })
                .then(function (result) {
                let commandLine = null;
                if (os.platform() == 'win32') {
                    commandLine = 'start ' + result[0].fsPath;
                    vscode.window.showInformationMessage("Opening the proyect...");
                    exec(commandLine);
                }
                else if (os.platform() == 'darwin') {
                    let appFile = result[0].fsPath.split('/').pop();
                    let path = result[0].fsPath.replace(appFile, '');
                    let fileNoExt = appFile.split('.');
                    Filehound.create()
                        .glob(fileNoExt[0])
                        .paths(path)
                        .find((err, htmlFiles) => {
                        if (err)
                            throw err;
                        commandLine = "open -F " + htmlFiles[0];
                        vscode.window.showInformationMessage("Opening the proyect...");
                        exec(commandLine);
                    })
                        .catch(function (err) {
                        vscode.window.showInformationMessage("Finding appxmanifest error: " + err);
                    });
                }
                vscode.window.showInformationMessage("Opening the proyect...");
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(error);
        }
        ;
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