'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Node Lib
const os = require("os");
const exec = require('child_process').exec;
const Filehound = require('filehound');

import {imageGeneratorProcess} from './modules/imageGenerator';
import {appPackageProcess} from './modules/appPackaging';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "PWA-Builder" is now active!');

    // ------------  IMAGE GENERATOR ---------------------------

    let inputBox = vscode.commands.registerCommand('extension.imageGenerator', () => {
        imageGeneratorProcess();
    });
    // -------------------- END IMAGE GENERATOR -------------------------------------

    // ------------------------- APPX PACKAGE ------------------------------------

    let appxPackage = vscode.commands.registerCommand('extension.appxPackage', () => {
        
        appPackageProcess();

    });

    // -------------------- END APPX PACKAGE ----------------------------

    // --------------------- EXECUTE PROJECT ---------------------------

    let executeProject = vscode.commands.registerCommand('extension.executeProject', () => {
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

                    let commandLine: any = null;
                    if (os.platform() == 'win32') {

                        commandLine = 'start ' + result[0].fsPath
                        vscode.window.showInformationMessage("Opening the proyect...")
                        exec(commandLine);

                    } else if (os.platform() == 'darwin') {

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
                                vscode.window.showInformationMessage("Finding appxmanifest error: " + err)
                            });


                    }
                    vscode.window.showInformationMessage("Opening the proyect...")



                })


        } catch (error) {
            vscode.window.showErrorMessage(error)
        };

    });

    // -------------------- END EXECUTE PROJECT -------------------------

    context.subscriptions.push(inputBox, appxPackage, executeProject);
}

// this method is called when your extension is deactivated
export function deactivate() {
}