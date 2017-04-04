'use strict';

var gutil = require("gulp-util");
var pkg = require("../package");
var appName = "";


module.exports = {
    appName: appName,

    paths: {
        src: "src",
        // src: "src-test",
        dist: "dist",
        devDist: "dist",
        tmp: ".tmp"

    },
    wiredep: {
        exclude: [/\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/require\.js/],
        directory: 'bower_components'
    },
    errorHandler: function(title) {
        'use strict';

        return function(err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        }

    }
};