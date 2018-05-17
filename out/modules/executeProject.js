"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const os = require("os");
const exec = require('child_process').exec;
const Filehound = require('filehound');
function executeProjectProcess() {
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
}
exports.executeProjectProcess = executeProjectProcess;
//# sourceMappingURL=executeProject.js.map