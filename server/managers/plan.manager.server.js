/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;


const Plan = mongoose.model("Plan");
const InitConfig = mongoose.model("InitConfig");
var planManager = {

};
module.exports = planManager;

planManager.createPlan = async(function*(owner, planInfo, cb) {

    if (typeof(planInfo) === "function") {
        cb = planInfo;
        planInfo = null;
    }

    var newplan = new Plan(planInfo);
    // newplan.name = planInfo.name;
    // newplan.version = planInfo.version || newplan.version;
    newplan.tracer.thisTag = new ObjectID();
    newplan.tracer.ownerTag = owner;
    // newplan.security.mode = planInfo.security.mode || newplan.security.mode;
    // newplan.security.config = planInfo.security.config;

    var doc = yield newplan.save();
    return cb(doc);

});