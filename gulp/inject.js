"use strict";

var gulp = require("gulp");
var path = require("path");
var conf = require("./config");
var wiredep = require("wiredep").stream;
var _ = require("lodash");

var $plugins = require("gulp-load-plugins")();

gulp.task("inject", ["scripts", "styles", "injectAuth", "inject404", "copyVendorImages", "partials"], function() {
    var injectStyles = gulp.src([
        path.join(conf.paths.tmp, conf.appName, "styles/main.css"),
    ], { read: false });

    var injectScripts = gulp.src([
        path.join(conf.paths.src, "/assets/js/**/*.js"),
        path.join(conf.paths.src, conf.appName, "**/*.module.js"),
        path.join(conf.paths.src, conf.appName, "**/*.js"),

        path.join("!" + conf.paths.src, conf.appName, "**/*.spec.js"),
        path.join("!" + conf.paths.src, conf.appName, "**/*.mock.js")

    ], { read: false });

    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, conf.appName, "/partials/templateCacheHtml.js"), { read: false });
    var partialsInjecOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp),
        addRootSlash: false
    };





    var injectOptions = {
        ignorePath: [path.join(conf.paths.src), path.join(conf.paths.tmp)],
        addRootSlash: false
    };

    return gulp.src(path.join(conf.paths.src, 'index.html'))
        .pipe($plugins.inject(partialsInjectFile, partialsInjecOptions))
        .pipe($plugins.inject(injectStyles, injectOptions))
        .pipe($plugins.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName)));

});

gulp.task("injectAuth", ["stylesAuth"], function() {
    return injectAlone({
        css: [path.join("!" + conf.paths.tmp, conf.appName, "/styles/vendor.css"), path.join(conf.paths.tmp, conf.appName, "/styles/auth.css")],
        paths: [path.join(conf.paths.src, "/auth.html"), path.join(conf.paths.src, "/reg.html")]
    });
});

gulp.task('inject404', ['styles404'], function() {
    return injectAlone({
        css: [path.join('!' + conf.paths.tmp, conf.appName, '/styles/vendor.css'), path.join(conf.paths.tmp, conf.appName, '/styles/404.css')],
        paths: path.join(conf.paths.src, '/404.html')
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
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName)));
};