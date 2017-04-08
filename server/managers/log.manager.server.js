const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const sysConfig = require("../config/sys.js");
const version = sysConfig.version;
const dbManager = require("./db.manager.server");


//
const Log = mongoose.model("Log");
const Accessor = mongoose.model("Accessor");

//创建系统日志
var systemLogAccessor;
// function* createLogAccessor() {
//     var logAccessor = new Accessor();
//     dbManager.initAccessor(logAccessor);

//     logAccessor.special = { logLevel: 7 };
//     yield logAccessor.save();
//     return logAccsssor;
// }

// function* createLog(logaccessorID, logInfo) {
//     var accessor = yield Accessor.findOne({ _id, logaccessorID });
//     if (logInfo.level && logInfo.level >= accessor.special.logLevel) {
//         var aLog = new Log(logInfo);
//         aLog.tracer.ownerTag = accessor.thisTag;
//         yield aLog.save();
//     } else { return }
// }
// module.exports.getALogAccessor = async(createLogAccessor);
module.exports.logInfo = function(accessorID, logInfo) {
    logInfo.level = 1;
    co(createLog(accessorID, logInfo));
};

const systemLogAccessorIDCfg = { name: "systemLogAccessorID", category: "system", version: version };

function* systemlog(title, content, level) {
    if (!systemLogAccessor) {
        systemLogAccessor = yield InitConfig.findOne(systemLogAccessorIDCfg);
    }
    if (level < systemLogAccessor.special.logLevel) {
        return; //不记录
    }
    var newLog = new Log();
    newLog.title = title;
    newLog.content = content;
    newLog.level = level;
    newLog.tracer.ownerTag = systemLogAccessor.thisTag;
    yield newLog.save();
}

module.exports.sysLogInfo = function(title, content) {
    co(systemlog(title, content, 1));
}
module.exports.sysLogError = function(title, content) {
    co(systemlog(title, content, 7));

}