/**
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const sysConfig = require("../config/sys");

const Schema = mongoose.Schema;

/**
 * user schema
 */

const InitConfigSchema = new Schema({
    version: { type: String, default: sysConfig.version },
    name: { type: String, required: true },
    category: { type: String, required: true },
    value: {}
});




mongoose.model('InitConfig', InitConfigSchema);