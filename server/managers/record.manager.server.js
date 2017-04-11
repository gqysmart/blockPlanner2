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
const dbManager = require("./db.manager.server");

const defaultRecordOptions = {
    category: "default",
    duration: 2, //unit is day，默认为2天
    style: "cover" //[cover,keep:n]
};
const MaxRecordDuration = 100 * 365; //最大缓存时间为100年

function* recordInfo(data, options, recordAccessorTag, IncubatorTag) {
    var recordAccessor = null;
    if (!recordAccessorTag) {
        var recordAccessor = new Accessor();
        dbManager.initRecordAccessor(recordAccessor);
        yield recordAccessor.save();

    } else {
        var recordAccessor = yield Accessor.findOne({ thisTag: recordAccessorTag, version: sysConfig.version });
        if (!recordAccessor) { //如果record为空，那么accessor 自动被删除掉。
            var recordAccessor = new Accessor();
            dbManager.initRecordAccessor(recordAccessor);
            yield recordAccessor.save();
        }

    }

    if (!options) { options = {} };
    _.defaults(options, defaultRecordOptions);
    if (options.duration > MaxRecordDuration) {
        var err = { no: -1, desc: `oops,excess the max duration ${MaxRecordDuration}` };
        throw (err);
    }
    switch (options.style) {
        case "cover":
            var newRecord = yield Record.findOne({ "tracer.ownerTag": recordAccessor.thisTag, "record.category": options.category });
            if (newRecord) {
                newRecord.record.data = data;
                newRecord.maintain.duration = options.duration
                newRecord.tracer.ownerTag = recordAccessor.thisTag;
                newRecord.tracer.updatedTime = Date.now();
                newRecord.markModified("data");
                newRecord.save();

            } else {
                newRecord = new Record();
                newRecord.record.category = options.category;
                newRecord.record.data = data;

                newRecord.maintain.duration = options.duration
                newRecord.tracer.ownerTag = recordAccessor.thisTag;
                yield newRecord.save();
            }

            break;

        case /keep:/:
            var rKeeps = (/keep:([0-9]+)/).exec(options.style);
            var nums = rKeeps[1];
            var recordNums = yield Record.find({ "tracer.ownerTag": recordAccessor.thisTag, "record.category": options.category }).count();
            if (recordNums >= nums) {
                var last = yield Record.find({ "tracer.ownerTag": recordAccessor.thisTag, "record.category": options.category }).sort({ "tracer.updatedTime": 1 }).limit(1).exec();
                last.record.data = data;
                last.maintain.duration = options.duration
                last.tracer.ownerTag = recordAccessor.thisTag;
                last.tracer.updatedTime = Date.now();
                last.markModified("data");
                last.save();

            } else {

                newRecord = new Record();
                newRecord.record.category = options.category;
                newRecord.record.data = data;

                newRecord.maintain.duration = options.duration
                newRecord.tracer.ownerTag = recordAccessor.thisTag;
                yield newRecord.save();
            }

            break;


    }

    recordAccessor.timemark.lastModified = Date.now();
    yield recordAccessor.save();

    return recordAccessor.toObject();
}

module.exports.record = async(recordInfo);