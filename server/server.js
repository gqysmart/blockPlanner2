var app = require("./config/express");
var config = require("./config/config");


var port = config.port;

app.listen(port,
    function() {
        console.log('server listening on port:' + port);
    });

module.exports = app;