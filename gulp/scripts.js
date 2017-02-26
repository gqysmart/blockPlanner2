"use strict";

var path = require("path");
var gulp = require("gulp");
var conf = require("./config");

var $plugins = require("gulp-load-plugins")();

gulp.task("scripts", function() {
    return gulp.src(path.join(conf.paths.src, "/app/**/*.js"))
        .pipe($plugins.eslint())
        .pipe($plugins.eslint.format())
        .pipe($plugins.size());


});