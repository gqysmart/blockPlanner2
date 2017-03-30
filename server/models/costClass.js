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
    thisTag: Schema.Types.ObjectId, //thisTag 实际上是多余的，与_ID 功能是一样的，但是语义上_id只是存储方式，thisTag是与存储无关的实现形式，暂时不考虑效能的话，多12字节一条记录。
    sourceTag: Schema.Types.ObjectId,
    opers: [String]
});



mongoose.model('CostClass', CostClassSchema);