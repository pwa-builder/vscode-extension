
import * as vscode from 'vscode';

const fs = require("fs");
const Filehound = require('filehound');
const { makeAppx } = require('cloudappx-server');
const Q = require('q');
const exec = require('child_process').exec;
const execute = Q.nfbind(exec);
const os = require("os");

function appPackageProcess() {

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
    };

    export {appPackageProcess}