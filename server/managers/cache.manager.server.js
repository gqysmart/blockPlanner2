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

const defaultCacheOptions = {
    category: "default",
    duration: 2, //unit is day，默认为2天
    style: "cover" //[cover,keep:n]
};
const MaxCacheDuration = 100 * 365; //最大缓存时间为100年

function* cacheInfo(data, options, cacheAccessorTag) {
    var cacheAccessor = null;
    if (!cacheAccessorTag) {
        var cacheAccessor = new Accessor();
        dbManager.initCacheAccessor(cacheAccessor);
        yield cacheAccessor.save();

    } else {
        var cacheAccessor = yield Accessor.findOne({ thisTag: cacheAccessorTag, version: sysConfig.version });
        if (!cacheAccessor) { //如果cache为空，那么accessor 自动被删除掉。
            var cacheAccessor = new Accessor();
            dbManager.initCacheAccessor(cacheAccessor);
            yield cacheAccessor.save();
        }

    }

    if (!options) { options = {} };
    _.defaults(options, defaultCacheOptions);
    if (options.duration > MaxCacheDuration) {
        var err = { no: -1, desc: `oops,excess the max duration ${MaxCacheDuration}` };
        throw (err);
    }
    switch (options.style) {
        case "cover":
            var newCache = yield Cache.findOne({ "tracer.ownerTag": cacheAccessor.thisTag, "cache.category": options.category });
            if (newCache) {
                newCache.cache.data = data;
                newCache.maintain.duration = options.duration
                newCache.tracer.ownerTag = cacheAccessor.thisTag;
                newCache.tracer.updatedTime = Date.now();
                newCache.markModified("data");
                newCache.save();

            } else {
                newCache = new Cache();
                newCache.cache.category = options.category;
                newCache.cache.data = data;

                newCache.maintain.duration = options.duration
                newCache.tracer.ownerTag = cacheAccessor.thisTag;
                yield newCache.save();
            }

            break;

        case /keep:/:
            var rKeeps = (/keep:([0-9]+)/).exec(options.style);
            var nums = rKeeps[1];
            var cachedNums = yield Cache.find({ "tracer.ownerTag": cacheAccessor.thisTag, "cache.category": options.category }).count();
            if (cacheNums >= nums) {
                var last = yield Cache.find({ "tracer.ownerTag": cacheAccessor.thisTag, "cache.category": options.category }).sort({ "tracer.updatedTime": 1 }).limit(1).exec();
                last.cache.data = data;
                last.maintain.duration = options.duration
                last.tracer.ownerTag = cacheAccessor.thisTag;
                last.tracer.updatedTime = Date.now();
                last.markModified("data");
                last.save();

            } else {

                newCache = new Cache();
                newCache.cache.category = options.category;
                newCache.cache.data = data;

                newCache.maintain.duration = options.duration
                newCache.tracer.ownerTag = cacheAccessor.thisTag;
                yield newCache.save();
            }

            break;


    }

    cacheAccessor.timemark.lastModified = Date.now();
    yield cacheAccessor.save();

    return cacheAccessor.toObject();
}

module.exports.cache = async(cacheInfo);