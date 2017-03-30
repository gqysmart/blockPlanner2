/**
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");

const Schema = mongoose.Schema;

/**
 * user schema
 */

const InitConfigSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    value: {}
});




mongoose.model('InitConfig', InitConfigSchema);