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

var CostClassSchema = new Schema({
    thisTag: Schema.Types.ObjectId,
    sourceTag: Schema.Types.ObjectId,
    opers: [String]
});



mongoose.model('CostClass', CostClassSchema);