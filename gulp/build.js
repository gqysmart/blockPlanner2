'use strict';

var gulp = require("gulp");
var conf = require("./config");
var path = require("path");
var useref = require("gulp-useref");

var $plugins = require("gulp-load-plugins")({ pattern: ['gulp-*', 'main-bower-files', 'del'] });
gulp.task("test", function() {
    gulp.src([path.join(conf.paths.src, "*.html")])
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName, "styles")));


});
gulp.task("clean", function() {
    return $plugins.del([path.join(conf.paths.tmp, "/"), path.join(conf.paths.dist, conf.appName)]);
});

gulp.task("build", ["html", "fonts", "other"]);



gulp.task("html", ["inject", "partials"], function() {

    var htmlFilter = $plugins.filter("**/*.ejs", { restore: true, dot: true });
    var jsFilter = $plugins.filter("**/*.js", { restore: true, dot: true });
    var cssFilter = $plugins.filter("**/*.css", { restore: true, dot: true });
    return gulp.src([path.join(conf.paths.tmp, conf.appName, "*.ejs")])
        .pipe(useref({
            transformPath: function(filePath) {
                return filePath;
            }
        }))
        .pipe(jsFilter)
        // .pipe($plugins.sourcemaps.init())
        .pipe($plugins.ngAnnotate())
        // .pipe($plugins.uglify())
        // .pipe($plugins.sourcemaps.write("maps"))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        // .pipe($plugins.sourcemaps.init())
        // .pipe($plugins.minifyCss({ processImport: false }))
        // .pipe($plugins.sourcemaps.write("maps"))
        .pipe(cssFilter.restore)
        //     //     //     .pipe($plugins.rev())

    // .pipe($plugins.revReplace())

    .pipe(htmlFilter)
        // .pipe($plugins.htmlmin({
        //     collapseWhitespace: true,
        //     conservativeCollapse: true,
        //     collapseInlineTagWhitespace: true
        // }))
        .pipe(htmlFilter.restore)
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName, ".")));
    // .pipe($plugins.size({ title: path.join(conf.paths.dist, "/"), showFiles: true }))



});

gulp.task("revision", ["html"], function() {
    return gulp.src([path.join(conf.paths.tmp, "scripts/*.js"), path.join(conf.paths.tmp, "styles/*.cs")])
        .pipe($plugins.rev())
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName, ".")))
        .pipe($plugins.rev.manifest())
        .pipe(gulp.dest(path.join(conf.paths.tmp, conf.appName, ".")));

});

gulp.task("revisionReplace", ["revision"], function() {

    var manifest = gulp.src(path.join(conf.paths.tmp, conf.appName, "rev-mainfest.json"));
    return gulp.src(path.join(conf.paths.tmp, conf.appName, "*.ejs"))
        .pipe($plugins.revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName)));


});

gulp.task('fonts', function() {
    return gulp.src($plugins.mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($plugins.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName, 'assets/fonts/')));
});

gulp.task('other', ['copyVendorImages'], function() {
    var fileFilter = $plugins.filter(function(file) {
        return file.stat.isFile();
    });

    return gulp.src([
            path.join(conf.paths.src, '**/*'),
            path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss,md}'),
            path.join(conf.paths.tmp, conf.appName, '**/assets/imgages/theme/vendor/**/*')
        ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, conf.appName, '/')));
});