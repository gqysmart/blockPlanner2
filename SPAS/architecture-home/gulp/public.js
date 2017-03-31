'use strict';

var gulp = require("gulp");
var conf = require("./config");
var path = require("path");
var useref = require("gulp-useref");

var $plugins = require("gulp-load-plugins")({ pattern: ['gulp-*', 'main-bower-files', 'del'] });

gulp.task("public", function() {
    gulp.src([path.join(conf.paths.src, "public/**")])
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName, "public/home")));


});