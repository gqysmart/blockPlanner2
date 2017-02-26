'use strict';

var gulp = require("gulp");
var conf = require("./config");
var path = require("path");
var useref = require("gulp-useref");

var $plugins = require("gulp-load-plugins")({ pattern: ['gulp-*', 'main-bower-files', 'del'] });

gulp.task("clean", function() {
    return $plugins.del([path.join(conf.paths.tmp, "/"), path.join(conf.paths.dist, "/")]);
});
gulp.task("build", ["html"]);


gulp.task("partials", function() {
    return gulp.src([
            path.join(conf.paths.src, "/app/**/*.html"),
        ])
        .pipe($plugins.htmlmin({

        }))
        .pipe($plugins.angularTemplatecache("templateCacheHtml.js", { module: "BlockPlanner", root: "app" }))
        .pipe(gulp.dest(conf.paths.tmp + "/partials/"));

});

gulp.task("html", ["inject", "partials"], function() {
    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, "/partials/templateCacheHtml.js"), { read: false });
    var partialsInjecOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp, "/partials"),
        addRootSlash: false
    };

    var htmlFilter = $plugins.filter("*.html", { restore: true, dot: true });
    var jsFilter = $plugins.filter("**/*.js", { restore: true, dot: true });
    var cssFilter = $plugins.filter("**/*.css", { restore: true, dot: true });

    return gulp.src([path.join(conf.paths.tmp, "/serve/*.html")])
        .pipe($plugins.inject(partialsInjectFile, partialsInjecOptions))
        .pipe(useref())

    // .pipe(jsFilter)
    //     .pipe($plugins.sourcemaps.init())
    //     .pipe($plugins.ngAnnotate())
    //     .pipe($plugins.uglify())
    //     .pipe($plugins.sourcemaps.write("maps"))
    //     .pipe(jsFilter.restore)

    // .pipe(cssFilter)
    //     .pipe($plugins.sourcemaps.init())
    //     .pipe($plugins.minifyCss({ processImport: false }))
    //     .pipe($plugins.sourcemaps.write("maps"))
    //     .pipe(cssFilter.restore)
    //     //     .pipe($plugins.rev())


    // // .pipe($plugins.useref())
    // //     .pipe($plugins.revReplace())
    // .pipe(htmlFilter)
    //     .pipe($plugins.htmlmin())
    //     .pipe(htmlFilter.restore)
    .pipe(gulp.dest(conf.paths.dist));
    // .pipe($plugins.size({ title: path.join(conf.paths.dist, "/"), showFiles: true }))












});