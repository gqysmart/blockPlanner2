/**
 * 
 * 
 */

const cluster = require('cluster');
const path = require("path");
const fs = require("fs");
const { wrap: async, co: co } = require("co");
const models = path.join(__dirname, "models");


if (cluster.isMaster) {
    function dayRoutine() {
        //tear off
    };

    function hourRoutine() {

    };

    function minuteRoutine() {

    }

    function messageHandler(msg) {
        if (msg.cmd) {
            switch (msg.cmd) {
                case "heartbeat":
                    break;
                case "register":
                    break;

            }

        }

    }


    setInterval(() => {
        dayRoutine();
    }, 24 * 3600 * 1000);
    setInterval(() => {
        hourRoutine();
    }, 3600 * 1000);
    setInterval(() => {
        minuteRoutine();
    });

    fs.readdirSync(models)
        .filter(file => ~file.search(/^[^\.].*\.js$/))
        .forEach(file => require(path.join(models, file)));

    const system = require("./managers/system.manager.server");
    system.init(function() { //系统初始化完成后，再fork。

        const numCPUs = require("os").cpus().length;

        for (let i = 0; i < 1; i++) {
            cluster.fork();
        }

        for (const id in cluster.workers) {
            cluster.workers[id].on("message", messageHandler);
        }
    });


} else {

    require("./server");

}