"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
// Node Lib
const request = require("request");
const http = require("http");
const fs = require("fs");
const AdmZip = require('adm-zip');
const FormData = require("form-data");
function imageGeneratorProcess() {
    const apiUrl = 'http://appimagegenerator-pre.azurewebsites.net/'; // 'http://localhost:49080/';
    let extractPath = '';
    let manifestFilePath = '';
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
                    .then(function (platforms) {
                    if (platforms != '') {
                        for (let i = 0; i < platforms.length; i++) {
                            formData.append('platform', (platforms[i]).toLowerCase());
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
                            var tmpFilePath = extractPath + "/" + newFileName + ".zip";
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
}
exports.imageGeneratorProcess = imageGeneratorProcess;
//# sourceMappingURL=imageGenerator.js.map