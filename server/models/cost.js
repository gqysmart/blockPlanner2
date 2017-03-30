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

const CostSchema = new Schema({
    type: { type: String, default: "copy", enum: ["copy", "clone"] },

});




mongoose.model('Cost', CostSchema);