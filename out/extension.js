'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// Node Lib
const request = require("request");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
// Image Generator Lib
const AdmZip = require('adm-zip');
const FormData = require("form-data");
// Appx Packaging Lib
const Filehound = require('filehound');
const { makeAppx } = require('cloudappx-server');
// Command Line
const Q = require('q');
const exec = require('child_process').exec;
const execute = Q.nfbind(exec);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "PWA-Builder" is now active!');
    // ------------  IMAGE GENERATOR ---------------------------
    let inputBox = vscode.commands.registerCommand('extension.imageGenerator', () => {
        const apiUrl = 'http://appimagegenerator-pre.azurewebsites.net/'; // 'http://localhost:49080/';
        let extractPath = '';
        let manifestFilePath = '';
        const tmpFolder = process.env.LOCALAPPDATA;
        vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: "Select image",
            filters: {
                'Images': ['bmp', 'png', 'jpg', 'jpeg']
            }
        })
            .then(function (result) {
            let imgUrl = result[0].fsPath;
            if (imgUrl != '') {
                try {
                    const formData = new FormData();
                    formData.append('fileName', fs.createReadStream(imgUrl));
                    // Platforms input
                    vscode.window.showQuickPick(["iOS", "Windows", "Windows10", "Android", "Chrome", "Firefox"], { canPickMany: true })
                        .then(function (result) {
                        if (result != '') {
                            for (let i = 0; i < result.length; i++) {
                                formData.append('platform', (result[i]).toLowerCase());
                            }
                            inputPadding();
                        }
                        else {
                            vscode.window.showErrorMessage("No platform was chosen.");
                        }
                    });
                    // Padding input
                    let inputPadding = function () {
                        vscode.window.showInputBox({ prompt: '0 is no padding, 1 is 100% of the source image. 0.3 is a typical value for most icons', placeHolder: '0.3' })
                            .then(function (resultPadding) {
                            let predetPadding = '0.3';
                            if (resultPadding != undefined && resultPadding != null && resultPadding != '') {
                                if (parseFloat(resultPadding) < 0 || parseFloat(resultPadding) > 0) {
                                    vscode.window.showErrorMessage("Incorrect padding value. It must be between 0 and 1.");
                                }
                                else {
                                    formData.append('padding', resultPadding);
                                    inputColorOption();
                                }
                            }
                            else {
                                formData.append('padding', predetPadding);
                                inputColorOption();
                            }
                        });
                    };
                    // Image Background
                    let inputColorOption = function () {
                        vscode.window.showQuickPick(["Transparent", "Custom Color"], { canPickMany: false })
                            .then(function (result) {
                            let color = '';
                            let colorOption = '0';
                            let colorChanged = '0';
                            if (result == "Custom Color") {
                                vscode.window.showInputBox({ prompt: 'Insert the hexadecimal code. Ex: #123456' })
                                    .then(function (resultColor) {
                                    if (resultColor.substring(0, 1) == '#' && resultColor.length == 7) {
                                        color = resultColor;
                                        colorOption = '1';
                                        colorChanged = '1';
                                        formData.append('colorOption', colorOption);
                                        formData.append('colorChanged', colorChanged);
                                        formData.append('color', color);
                                        setExtractPath();
                                    }
                                    else {
                                        vscode.window.showErrorMessage("Invalid value, it must be like #123456.");
                                    }
                                });
                            }
                            else {
                                formData.append('colorOption', colorOption);
                                formData.append('colorChanged', colorChanged);
                                formData.append('color', color);
                                setExtractPath();
                            }
                        });
                    };
                    // Select of extraction path
                    let setExtractPath = function () {
                        vscode.window.showOpenDialog({
                            canSelectFiles: false,
                            canSelectFolders: true,
                            canSelectMany: false,
                            openLabel: "Select Assets Path",
                        })
                            .then(function (result) {
                            extractPath = result[0].path.substring(1);
                            let folderName = extractPath.split('/').pop();
                            if (folderName.toLowerCase() == 'assets') {
                                setManifestPath();
                            }
                            else {
                                vscode.window.showErrorMessage("Wrong folder name. It must be the Assets folder.");
                            }
                        });
                    };
                    // Select of manifest path
                    let setManifestPath = function () {
                        vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            openLabel: "Select the Manifest file",
                        })
                            .then(function (result) {
                            manifestFilePath = result[0].path.substring(1);
                            let fileNameManifest = manifestFilePath.split('/').pop(); //FileName with extension
                            let extensionFile = fileNameManifest.split('.').pop(); // Extension
                            if (extensionFile.toLowerCase() == 'json') {
                                sendToApi();
                            }
                            else {
                                vscode.window.showErrorMessage("Invalid Manifest format");
                            }
                        });
                    };
                    let sendToApi = function () {
                        request.post(apiUrl + 'api/image/', {
                            body: formData,
                            headers: formData.getHeaders()
                        }, function (err, res) {
                            const resultZipUri = JSON.parse(res.body).Uri;
                            try {
                                let newFileName = 'AppImages';
                                var tmpFilePath = tmpFolder + "/" + newFileName + ".zip";
                                http.get(apiUrl + resultZipUri.substring(1), function (response) {
                                    response.on('data', function (data) {
                                        fs.appendFileSync(tmpFilePath, data);
                                    });
                                    response.on('end', function () {
                                        var zip = new AdmZip(tmpFilePath);
                                        zip.extractAllTo(extractPath, true);
                                        fs.unlink(tmpFilePath);
                                        let jsonManifest = JSON.parse(fs.readFileSync(manifestFilePath, function (err, data) { if (err) {
                                            throw err;
                                        } }));
                                        let jsonIcons = JSON.parse(fs.readFileSync(extractPath + '/icons.json', function (err, data) { if (err) {
                                            throw err;
                                        } }));
                                        jsonManifest.icons = jsonIcons.icons;
                                        fs.writeFileSync(manifestFilePath, JSON.stringify(jsonManifest));
                                        vscode.window.showInformationMessage("Manifest update complete.");
                                    });
                                });
                            }
                            catch (err) {
                                vscode.window.showInformationMessage("Error on Zip Request: " + err);
                            }
                        });
                    };
                }
                catch (error) {
                    vscode.window.showInformationMessage('Error: ' + error);
                }
            }
            else {
                vscode.window.showInformationMessage("No image selected");
            }
        });
    });
    // -------------------- END IMAGE GENERATOR -------------------------------------
    // ------------------------- APPX PACKAGE ------------------------------------
    let appxPackage = vscode.commands.registerCommand('extension.appxPackage', () => {
        console.log("appxPackage");
        try {
            let xmlPath;
            let filesFound;
            let manifestPath;
            let manifestJson;
            // Manifest file picker
            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Select manifest.json",
            })
                .then(function (result) {
                manifestPath = result[0].fsPath;
                manifestJson = JSON.parse(fs.readFileSync(result[0].fsPath, function (err, data) { if (err) {
                    throw err;
                } }));
                // Output folder picker where the app will be generated
                vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: "Select destination folder",
                })
                    .then(function (result) {
                    xmlPath = result[0].fsPath;
                    // The data required by the MakeAppx is added manually
                    manifestJson.out = xmlPath;
                    manifestJson.dir = xmlPath;
                    vscode.window.showInformationMessage("Generating package. Please wait.");
                    let cmdline = "pwabuilder -m " + manifestPath + " -p windows10 -d " + xmlPath;
                    execute(cmdline)
                        .then(function () {
                        Filehound.create()
                            .match('appxmanifest.xml')
                            .paths(xmlPath)
                            .find((err, htmlFiles) => {
                            if (err)
                                throw err;
                            filesFound = htmlFiles;
                        }).then(function () {
                            fs.rename(filesFound[0], xmlPath + "\\appxmanifest.xml");
                            makeAppx(manifestJson)
                                .then(function (res) {
                                vscode.window.showInformationMessage("Appx packaging complete.");
                            })
                                .catch(function (err) {
                                vscode.window.showInformationMessage("Appx packaging error: " + err);
                            });
                        })
                            .catch(function (err) {
                            vscode.window.showInformationMessage("Finding appxmanifest error: " + err);
                        });
                    })
                        .catch(function (cat) {
                        if (cat) {
                            throw cat;
                        }
                    });
                });
            });
        }
        catch (error) {
            vscode.window.showInformationMessage(error);
        }
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
                openLabel: "Select manifest.xml",
            })
                .then(function (result) {
                console.log("OS: ", os.platform());
                console.log("file path: ", result[0].fsPath);
                try {
                    let commandLine = null;
                    if (os.platform() != 'darwin') {
                        console.log("Windows");
                        commandLine = 'start ' + result[0].fsPath;
                    }
                    else {
                        console.log("MacOS");
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
                        })
                            .catch(function (err) {
                            vscode.window.showInformationMessage("Finding appxmanifest error: " + err);
                        });
                    }
                    // hwa.registerApp(path.resolve(result[0].fsPath))
                    // .catch(function(error:any){if(error){throw error}})
                    vscode.window.showInformationMessage("Opening the proyect...");
                    exec(commandLine)
                        .then(function (res) { console.log("Open"); })
                        .catch(function (cat) { console.log("Error: ", cat); });
                }
                catch (error) {
                    vscode.window.showErrorMessage("The file must be XML");
                }
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