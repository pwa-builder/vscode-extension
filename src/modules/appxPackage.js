
const Q = require('q');
const exec = require('child_process').exec;
const execute = Q.nfbind(exec);

const Filehound = require('filehound');
const fs = require("fs");

function commandLine(manifestPath, manifestJson,xmlPath, platforms) {

    console.log("commandLine", platforms)
    try {
      let cmdline = "pwabuilder -m " + manifestPath + " -p " + platforms + " -d " + xmlPath
      return  execute(cmdline)
      
    } catch (error) {
      console.log("err",error)
      return error
    }

}


module.exports = {commandLine: commandLine}