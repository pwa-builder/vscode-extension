'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {imageGeneratorProcess} from './modules/imageGenerator'
import {appPackageProcess} from './modules/appPackaging';
import {executeProjectProcess} from './modules/executeProject';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "PWA-Builder" is now active!');

    let inputBox = vscode.commands.registerCommand('extension.imageGenerator', () => {

        imageGeneratorProcess();

    });

    let appxPackage = vscode.commands.registerCommand('extension.appxPackage', () => {
        
        appPackageProcess();

    });

    // --------------------- EXECUTE PROJECT ---------------------------

    let executeProject = vscode.commands.registerCommand('extension.executeProject', () => {
        
        executeProjectProcess();

    });

    // -------------------- END EXECUTE PROJECT -------------------------

    context.subscriptions.push(inputBox, appxPackage, executeProject);
}

// this method is called when your extension is deactivated
export function deactivate() {
}