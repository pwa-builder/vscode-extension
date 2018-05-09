#  PWA-Builder Extension

This extension allow you create the necesaries images for manifest file, package the project as Appx file and execute an appx package.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [NPM](http://npmjs.com/)

## Dependecies

* Vue.js
* CloudAppx
* HWA
* Filehound
* PWA-Builder

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`

## Pallet Commands

|  **&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Command&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;** | **Description** |
| ----------------- | --------------- |
| `Appx Package`     | This command generates the Appx package |
| `Execute Package`     | Execute a app from manifest.xml file |
| `Image Generator`     | Generates the images that you need for manifest.   |

## Commands Guide
### Appx Packaging
Select manifest.json <br>
![Picture](Readme-Files/AppxPackaging-Images/AppxPackaging-Step1.PNG)

Select output folder <br>
![Picture](Readme-Files/AppxPackaging-Images/AppxPackaging-Step2.PNG)

Select platform where the package will be install <br>
![Picture](Readme-Files/AppxPackaging-Images/AppxPackaging-Step3.PNG)

Wait a moment and when the package it is ready a information message will show up <br>
![Picture](Readme-Files/AppxPackaging-Images/AppxPackaging-Step4.PNG)

And if we open the chosen output folder we can see the followings files: site folder, appx manifest file and the site package. <br>

![Picture](Readme-Files/AppxPackaging-Images/AppxPackaging-FilesResult.PNG)

* __Site Folder__: This folder contains the PWA-Builder result files.
* __Appx Manifest__: This file is a XML file that has been created by the PWA-Builder package and it's needed for the Appx Packaging.
* __Site Package__: If we double click it, this gonna open the site as Windows App.

### Execute Project

Select the manifest file that you want execute (It must be a XML file). <br>
![Picture](Readme-Files/ExecuteProject-Images/ExecuteProject-Step1.PNG)

### Image Generator

Select image <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step1.PNG)

Select platforms <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step2.PNG)

input padding <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step3.png)

select between transparent or color image background, ifcolor set the hex value <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step4.png)

Select assets folder <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step5.png)

Select manifest.json <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-Step6.png)

#### Before command execute 
Assets Folder <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-AssetsBefore.png)

Manifest File <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-ManifestBefore.png)

#### After command execute 
Assets Folder <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-AssetsAfter.png)

Manifest File <br>
![Picture](Readme-Files/ImageGenerator-Images/ImageGenerator-ManifestAfter.png)

## Built With

* VS Code
* Node.js
 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [PWA-Builder](http://www.pwabuilder.com)
