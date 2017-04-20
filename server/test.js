/**
 * 
 * 
 * 
 */
require('dotenv').config();
const fs = require("fs");
const join = require("path").join;
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const config = require("./config/config");
const sysConfig = require("./config/sys");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;

const models = join(__dirname, "models");
const port = process.env.PORT || 3200;
/** expose */
//
const appDbConnectString = sysConfig.appdb.connectString;

mongoose.connect(appDbConnectString);


fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));
// routes


const Record = mongoose.model("Record");
co(function*() {
    var items = yield Record.find();
    yield Record.remove(items);
})