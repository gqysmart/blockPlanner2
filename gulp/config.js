'use strict';

var gutil = require("gulp-util");
var appName = "app";


module.exports = {
    appName: appName,

    paths: {
        src: "src",
        // src: "src-test",
        dist: "server",
        devDist: "server",
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