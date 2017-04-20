const fs = require("fs");
const path = require("path");

module.exports = {
    readDirSyncRecursive
};

var readDirSyncRecursive = function(baseDir) {
    baseDir = baseDir.replace('/\/$/', '');

    var files = [],
        curFiles,
        nextDirs;
    var isDir = function(fName) {
        return fs.existsSync(path.join(baseDir, fName)) ? fs.statSync(path.join(baseDir, fName)).isDirectory() : false;
    };
    var prependBaseDir = function(fName) {
        return path.join(baseDir, fName);
    };

    curFiles = fs.readdirSync(baseDir);
    nextDirs = curFiles.filter(isDir);
    curFiles = curFiles.map(prependBaseDir);

    files = files.concat(curFiles);
    while (nextDirs.length) {
        files = files.concat(readDirSyncRecursive(path.join(baseDir, nextDirs.shift())));
    }

    return files;
};