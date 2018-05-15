'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Node Lib

const fs = require("fs");

const os = require("os");
// Appx Packaging Lib

const Filehound = require('filehound');
const { makeAppx } = require('cloudappx-server');

// Command Line
const Q = require('q');
const exec = require('child_process').exec;
const execute = Q.nfbind(exec);

import {imageGeneratorProcess} from './modules/imageGenerator';

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
        console.log("appxPackage")

        try {
            let xmlPath: any;
            let filesFound: any;
            let manifestPath: any;
            let manifestJson: any;

            // Manifest file picker

            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Select manifest.json",

            })
                .then(function (result: any) {
                    manifestPath = result[0].fsPath;
                    manifestJson = JSON.parse(fs.readFileSync(result[0].fsPath, function (err: any, data: any) { if (err) { throw err; } }));

                    // Output folder picker where the app will be generated
                    vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: "Select destination folder",

                    })
                        .then(function (result: any) {
                            xmlPath = result[0].fsPath;
                            // The data required by the MakeAppx is added manually
                            manifestJson.out = xmlPath;
                            manifestJson.dir = xmlPath;
                            vscode.window.showInformationMessage("Generating package. Please wait.")

                            if (os.platform() == 'win32') {

                                let cmdline = "pwabuilder -m " + manifestPath + " -p windows10 -d " + xmlPath
                                execute(cmdline)
                                    .then(function () {
                                        Filehound.create()
                                            .match('appxmanifest.xml')
                                            .paths(xmlPath)
                                            .find((err: any, htmlFiles: any) => {
                                                if (err) throw err;
                                                filesFound = htmlFiles;
                                            }).then(
                                                function () {
                                                    fs.rename(filesFound[0], xmlPath + "\\appxmanifest.xml")

                                                    makeAppx(manifestJson)
                                                        .then(function (res: any) {
                                                            vscode.window.showInformationMessage("Appx packaging complete.")

                                                        })
                                                        .catch(function (err: any) {
                                                            vscode.window.showInformationMessage("Appx packaging error: " + err)
                                                        })
                                                }
                                            )
                                            .catch(function (err: any) {
                                                vscode.window.showInformationMessage("Finding appxmanifest error: " + err)
                                            });
                                    }
                                    )
                                    .catch(function (cat: any) {
                                        if (cat) {
                                            throw cat
                                        }
                                    });
                            } else if (os.platform() == 'darwin') {
                                let cmdline = "pwabuilder -m " + manifestPath + " -p mac -d " + xmlPath
                                execute(cmdline)
                                    .then(
                                        function () {
                                            console.log('appname', manifestJson.short_name)
                                            vscode.window.showInformationMessage("Just a little bit more...")

                                            Filehound.create()
                                                .glob(manifestJson.short_name)
                                                .paths(xmlPath)
                                                .ignoreHiddenDirectories()
                                                //.ignoreHiddenFiles()
                                                .find((err: any, htmlFiles: any) => {
                                                    if (err) throw err;
                                                    console.log('filesfound', htmlFiles, 'error filesfound', err)

                                                })
                                                .catch(function (err: any) {
                                                    vscode.window.showInformationMessage("Finding appxmanifest error: " + err)
                                                });

                                        }
                                    )
                                    .catch(function (cat: any) {
                                        if (cat) {
                                            throw cat
                                        }
                                    });
                            }

                        })
                })
        } catch (error) {
            vscode.window.showInformationMessage(error)
        }


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