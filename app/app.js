var app = require("./server/express");
var config = require("./config");


var port = config.port;

app.listen(port,
    function() {
        console.log('server listening on port:' + port);
    });

module.exports = app;