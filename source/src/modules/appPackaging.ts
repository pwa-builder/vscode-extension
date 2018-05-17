
import * as vscode from 'vscode';

const fs = require("fs");
const Filehound = require('filehound');
const { makeAppx } = require('cloudappx-server');
const Q = require('q');
const exec = require('child_process').exec;
const execute = Q.nfbind(exec);
const os = require("os");

function appPackageProcess() {

    let xmlPath: any;
    let filesFound: any;
    let manifestPath: any;
    let manifestJson: any;
    try {
            
            // Manifest file picker

            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Select manifest.json",
                
            })
                .then(function (result: any) {
                    let file = ((result[0].fsPath).split('\\').pop()).split('.');
                    if(file[1].toLowerCase() == 'json'){

                        manifestPath = result[0].fsPath;
                        
                        manifestJson = JSON.parse(fs.readFileSync(result[0].fsPath));
                        
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
                                
                                let cmdline = `pwabuilder -m  ${manifestPath} -p windows10 -d ${xmlPath}`
                                execCmdLineWin32(cmdline);
                                
                            } else if (os.platform() == 'darwin') {
                                
                                let cmdline = `pwabuilder -m ${manifestPath} -p mac -d ${xmlPath}`
                                execCmdLineDarwin(cmdline);
                            }
                            
                        })
                    } else {
                        vscode.window.showErrorMessage("The format is invalid. Please check.")
                        
                    }
                    })
            } catch (error) {
                vscode.window.showInformationMessage(error)
            }



            // Sub-functions


            function execCmdLineWin32(cmdline:any){
                execute(cmdline)
                .then(function () {
                    Filehound.create()
                            .match('appxmanifest.xml')
                            .paths(xmlPath)
                            .find((err: any, files: any) => {
                                if (err) throw err;
                                filesFound = files;
                            }).then(
                                function () {
                                    fs.rename(filesFound[0], `${xmlPath}\\appxmanifest.xml`)

                                    makeAppx(manifestJson)
                                    .then(function (res: any) {
                                        vscode.window.showInformationMessage("Appx packaging complete.")

                                    })
                                    .catch(function (err: any) {
                                        vscode.window.showInformationMessage(`Appx packaging error: ${err}`)
                                    })
                                    }
                            )
                            .catch(function (err: any) {
                                vscode.window.showInformationMessage(`Finding appxmanifest error: ${err}`)
                            });
                        }
                    )
                    .catch(function (cat: any) {
                        if (cat) {
                            throw cat
                        }
                    });
            }

            function execCmdLineDarwin(cmdline:any){
                execute(cmdline)
                                .then(
                                        function () {
                                            
                                            vscode.window.showInformationMessage("Just a little bit more...")
                                            
                                            Filehound.create()
                                                .glob(manifestJson.short_name)
                                                .paths(xmlPath)
                                                .ignoreHiddenDirectories()
                                                //.ignoreHiddenFiles()
                                                .find((err: any, htmlFiles: any) => {
                                                    if (err) throw err;
                                                   
                                                })
                                                .catch(function (err: any) {
                                                    vscode.window.showInformationMessage(`Finding appxmanifest error: ${err}`)
                                                });

                                            }
                                        )
                                    .catch(function (cat: any) {
                                        if (cat) {
                                            throw cat
                                        }
                                    });
            }
    };

    export {appPackageProcess}