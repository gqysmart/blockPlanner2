"use strict";

var gulp = require("gulp");
var path = require("path");
var conf = require("./config");
var wiredep = require("wiredep");
var _ = require("lodash");

var $plugins = require("gulp-load-plugins")();

gulp.task("styles", function() {

    var injectFiles = gulp.src([
        path.join(conf.paths.src, "/sass/**/_*.scss",
            "!" + path.join(conf.paths.src, "/sass/theme/conf/**/*.scss")

        )
    ], { read: false });

    var injectOptions = {
        transform: function(filePath) {
            filePath = filePath.replace(conf.path.src + /sass/, "");
            return "@import" + filePath + ";";
        },
        startTag: "// injector",
        endTag: "// endinjector",
        addRootSlash: false

    };

    var sassOptions = {
        outputStyle: "expanded"

    };

    return gulp.src([
            path.join(conf.paths.src, "/sass/main.scss")
        ])
        .pipe($plugins.inject(injectFiles, injectOptions))
        .pipe($plugins.sourcemaps.init())
        .pipe($plugins.sass(sassOptions)).on("error", conf.errorHandler("Sass"))
        .pipe($plugins.autoprefixer()).on("error", conf.errorHandler("Autoprefixer"))
        .pipe($plugins.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName, "styles")));




});

gulp.task("stylesAuth", function() {
    return buildSingleScss(path.join(conf.paths.src, "/sass/auth.scss"));
});

gulp.task("styles404", function() {
    return buildSingleScss(path.join(conf.paths.src, "/sass/404.scss"));
});



var buildSingleScss = function(paths) {
    var sassOptions = {
        outputStyle: "expanded"
    }

    return gulp.src([paths])
        .pipe($plugins.sass(sassOptions)).on("error", conf.errorHandler("Sass"))
        .pipe($plugins.autoprefixer()).on("error", conf.errorHandler("Autoprefixer"))
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName, "styles")));

};