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

var CostClassSchema = new Schema({ //方案如果公用管理层级的，就相当于双向共连了，但是双向有没有意义？怎么通知已经改动？这种机制还是要考虑的，不一定用于这里，为了一个字段耗费了太多的跟踪数据了。
    thisTag: Schema.Types.ObjectId, //thisTag 实际上是多余的，与_ID 功能是一样的，但是语义上_id只是存储方式，thisTag是与存储无关的实现形式，暂时不考虑效能的话，多12字节一条记录。
    sourceTag: Schema.Types.ObjectId,
    opers: [String]
});



mongoose.model('CostClass', CostClassSchema);