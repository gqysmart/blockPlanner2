"use strict";

var gulp = require("gulp");
var path = require("path");
var conf = require("./config");
var wiredep = require("wiredep").stream;
var _ = require("lodash");

var $plugins = require("gulp-load-plugins")();

gulp.task("inject", ["scripts", "styles"], function() {
    var injectStyles = gulp.src([
        path.join(conf.paths.tmp, "/serve/app/main.css"),
    ], { read: false });

    var injectScripts = gulp.src([
        path.join(conf.paths.src, "/assets/js/**/*.js"),
        path.join(conf.paths.src, "/app/**/*.module.js"),
        path.join(conf.paths.src, "/app/**/*.js"),

        path.join("!" + conf.paths.src, "/app/**/*.spec.js"),
        path.join("!" + conf.paths.src, "/app/**/*.mock.js")

    ], { read: false });

    var injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp, "/serve")],
        addRootSlash: false
    };

    return gulp.src(path.join(conf.paths.src, '/index.html'))
        .pipe($plugins.inject(injectStyles, injectOptions))
        .pipe($plugins.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp, "/serve")));




});