'use strict';

var gulp = require("gulp");
var conf = require("./config");
var path = require("path");
var through = require("through2");
var childProcess = require("child_process");

gulp.task("deploy", function() {
    childProcess.execSync("cd SPAS/architecture-planmanager && gulp");
    gulp.src("SPAS/architecture-planmanager/dist/**").pipe(gulp.dest("server/app/"));
    //
    childProcess.execSync("cd SPAS/architecture-home && gulp");
    gulp.src("SPAS/architecture-home/dist/**").pipe(gulp.dest("server/app/"));
    //
    childProcess.execSync("cd SPAS/architecture-projectManager && gulp");
    gulp.src("SPAS/architecture-projectManager/dist/**").pipe(gulp.dest("server/app/"));

});