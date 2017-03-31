'use strict';

var gulp = require("gulp");
var conf = require("./config");
var path = require("path");
var useref = require("gulp-useref");

var $plugins = require("gulp-load-plugins")({ pattern: ['gulp-*', 'main-bower-files', 'del'] });



gulp.task("partials", function() {
    return gulp.src([
            path.join(conf.paths.src, conf.appName, "/**/*.html"),
            //         path.join(conf.paths.tmp, conf.appName, "*.html")
        ])
        .pipe($plugins.htmlmin({
            caseSensitive: true,
            collapseWhitespace: true,

        }))
        .pipe($plugins.angularTemplatecache("templateCacheHtml.js", { module: "BlurAdmin", root: "app" }))
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName, "/partials/")));
});