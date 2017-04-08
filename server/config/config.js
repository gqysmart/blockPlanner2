var sysConfig = require("./sys");

module.exports = {
    debug: true,
    port: 3200,
    ngDir: "server/ng/",
    appName: "BD",
    appTitle: "GC Architecture",
    appDesc: "",
    email: "157900653@qq.com",
    sessionSecret: "hello,this world is  so good!",

    //db
    dbUrl: sysConfig.appdb.connectString
};