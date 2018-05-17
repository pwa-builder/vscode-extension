import * as vscode from 'vscode';

const os = require("os");
const exec = require('child_process').exec;
const Filehound = require('filehound');

function executeProjectProcess() {
    console.log("executeProject")
        try {
            // The manifest must be a xml file.

            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Select APPX Package",

            })
                .then(function (result: any) {
                    console.log("result ", result[0].fsPath)
                    let file = ((result[0].fsPath).split('\\').pop()).split('.');

                    let commandLine: any = null;
                    if (os.platform() == 'win32' && file[1].toLowerCase() == 'appx') {

                        commandLine = 'start ' + result[0].fsPath

                        vscode.window.showInformationMessage("Opening the proyect...")
                        exec(commandLine);

                    } else if (os.platform() == 'darwin' && file[1].toLowerCase() == 'app') {

                        let appFile = result[0].fsPath.split('/').pop()
                        let path = result[0].fsPath.replace(appFile, '')

                        let fileNoExt = appFile.split('.');

                        Filehound.create()
                            .glob(fileNoExt[0])
                            .paths(path)
                            .find((err: any, htmlFiles: any) => {

                                if (err) throw err;

                                commandLine = "open -F " + htmlFiles[0]
                                vscode.window.showInformationMessage("Opening the proyect...")
                                exec(commandLine);

                            })
                            .catch(function (err: any) {
                                vscode.window.showInformationMessage("Error finding the app file: " + err)
                            });


                    }else{
                        vscode.window.showErrorMessage("The format is invalid. Please check.")
                    }
                    



                })


        } catch (error) {
            vscode.window.showErrorMessage(error)
        };
}

export {executeProjectProcess}