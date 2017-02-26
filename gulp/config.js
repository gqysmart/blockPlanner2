'use strict';

var gutil = require("gulp-util");
var appName = "blockPlanner";


module.exports = {
    appName: appName,

    paths: {
        src: appName + "-src",
        // src: "src-test",
        dist: "server/apps/" + appName,
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