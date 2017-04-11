/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const InitConfig = mongoose.model("InitConfig");

const CalcRuleManager = require("./calcRule.manager.server");
const PDCManager = require("./pdc.manager.server");
const RecordManager = require("./record.manager.server");