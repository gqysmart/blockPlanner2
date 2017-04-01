'use strict';
var gulp = require("gulp");
var fs = require("fs-extra");
var path = require("path");

var gulpDir = "./gulp/";
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

var gulpFiles = readDirSyncRecursive(gulpDir);
gulpFiles = gulpFiles && gulpFiles.map(function(val, _) {
    return path.relative(gulpDir, val);

});

gulpFiles.filter(function(file) {
        return (/\.(?:js|coffee)$/i).test(file);
    })
    .map(function(file) {
        require(gulpDir + file);
    });


gulp.task('default', ["clean"], function() {
    gulp.start("deploy");

});