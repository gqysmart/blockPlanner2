"use strict";

var gulp = require("gulp");
var path = require("path");
var conf = require("./config");
var wiredep = require("wiredep").stream;
var _ = require("lodash");

var $plugins = require("gulp-load-plugins")();

gulp.task("inject", ["scripts", "styles", "injectAuth", "inject404", "copyVendorImages", "partials"], function() {
    var injectStyles = gulp.src([
        path.join(conf.paths.tmp, "styles/main.css"),
    ], { read: false });

    var injectScripts = gulp.src([
        path.join(conf.paths.src, "/assets/js/**/*.js"),
        path.join(conf.paths.src, "**/*.module.js"),
        path.join(conf.paths.src, "**/*.js"),

        path.join("!" + conf.paths.src, "**/*.spec.js"),
        path.join("!" + conf.paths.src, "**/*.mock.js")

    ], { read: false });

    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, "/partials/templateCacheHtml.js"), { read: false });
    var partialsInjecOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp),
        addRootSlash: false
    };





    var injectOptions = {
        ignorePath: [path.join(conf.paths.src), path.join(conf.paths.tmp)],
        addRootSlash: false
    };

    return gulp.src(path.join(conf.paths.src, 'index.ejs'))
        .pipe($plugins.inject(partialsInjectFile, partialsInjecOptions))
        .pipe($plugins.inject(injectStyles, injectOptions))
        .pipe($plugins.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp)));

});

gulp.task("injectAuth", ["stylesAuth"], function() {
    return injectAlone({
        css: [path.join("!" + conf.paths.tmp, "/styles/vendor.css"), path.join(conf.paths.tmp, "/styles/auth.css")],
        paths: [path.join(conf.paths.src, "/auth.ejs"), path.join(conf.paths.src, "/reg.ejs")]
    });
});

gulp.task('inject404', ['styles404'], function() {
    return injectAlone({
        css: [path.join('!' + conf.paths.tmp, '/styles/vendor.css'), path.join(conf.paths.tmp, '/styles/404.css')],
        paths: path.join(conf.paths.src, '/404.ejs')
    });
});




var injectAlone = function(options) {
    var injectStyles = gulp.src(
        options.css, { read: false });

    var injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp)],
        addRootSlash: false
    };

    return gulp.src(options.paths)
        .pipe($plugins.inject(injectStyles, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp)));
};