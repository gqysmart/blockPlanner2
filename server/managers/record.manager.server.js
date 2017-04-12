/**
 * 
 * 
 * 
 */

const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const sysConfig = require("../config/sys.js");
//
const CalcRuleDescriptor = mongoose.model("CalcRuleDescriptor");
//const CalcRuleAccessor = mongoose.model("CalcRuleAccessor");
const InitConfig = mongoose.model("InitConfig");
const Accessor = mongoose.model("Accessor");
const Record = mongoose.model("Record");
const Incubator = mongoose.model("Incubator");
const dbMgr = require("./db.manager.server");
const incubatorMgr = require("./incubator.manager.server");


const defaultRecordOptions = {
    duration: 2, //unit is day，默认为2天
    keeps: 1 //[cover,keep:n]
};
const MaxRecordDuration = 100 * 365; //最大缓存时间为100年

function* recordInfo(data, category, environment, incubatorAccessorTag, incubatorTag, options) {
    var incubatorAccessor = yield Accessor.findOne({ thisTag: incubatorAccessorTag, version: sysConfig.version });
    var incubator = yield Incubator.findOne({ "tracer.ownerTag": incubatorAccessor.thisTag, name: incubatorTag });
    var recordAccessor = yield Accessor.findOne({ thisTag: incubator.container.recordAccessorTag, version: sysConfig.version });


    if (!options) { options = {} };
    _.defaults(options, defaultRecordOptions);
    if (options.duration > MaxRecordDuration) {
        var err = { no: -1, desc: `oops,excess the max duration ${MaxRecordDuration}` };
        throw (err);
    }
    var recordCriteria = { "tracer.ownerTag": recordAccessor.thisTag, "record.category": category, "record.environment": environment };

    var context = {};
    var resultRecord = null;
    yield doUpdateRecords();

    recordAccessor.timemark.lastModified = Date.now();
    yield recordAccessor.save();
    return resultRecord;


    function* doUpdateRecords() {
        var environment = yield incubatorMgr.getEnvironmentFromIncubator(incubator);
        yield dbMgr.holdLockAndOper(recordAccessor.thisTag, async(function*(context) {
            var nums = options.keeps;
            var recordNums = yield Record.find(recordCriteria).count();
            if (recordNums >= nums) {
                var invalidRecordsNums = recordNums - nums + 1;

                var invalidRecords = yield Record.find(recordCriteria).sort({ "tracer.updatedTime": 1 }).limit(invalidRecordsNums).exec();
                var last = invalidRecords[invalidRecordsNums - 1];
                if (invalidRecords.length > 1) { //update effiency is better than insert.
                    var needRemovedCriteria = { "tracer.updatedTime": { $lt: last.tracer.updatedTime } };
                    _.defaults(needRemovedCriteria, recordCriteria);
                    yield Record.remove(needRemovedCriteria);
                }
                last.record.data = data;
                last.maintain.duration = options.duration
                last.tracer.ownerTag = recordAccessor.thisTag;
                newRecord.record.data = data;
                last.tracer.updatedTime = Date.now();
                last.markModified("data");
                last.save();
                resultRecord = last;

            } else {

                var newRecord = new Record();
                newRecord.record.category = category;
                newRecord.record.environment = environment;
                newRecord.record.data = data;

                newRecord.maintain.duration = options.duration
                newRecord.tracer.ownerTag = recordAccessor.thisTag;
                yield newRecord.save();
                resultRecord = newRecord;
            }

        }), context);



    }
}

module.exports.record = async(recordInfo);