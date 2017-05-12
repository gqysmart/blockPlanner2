const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;

const sysConfig = require("../config/sys");
const version = sysConfig.version;
const exceptionMgr = require("./exception.manager.server");