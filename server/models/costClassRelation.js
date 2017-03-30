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

const CostClassRelationSchema = new Schema({
    name: { type: Schema.Types.ObjectId, required: true },
    className: { type: Schema.Types.ObjectId },
    tracer: {
        targetTag: Schema.Types.ObjectId,
        overrided: { type: Schema.Types.Boolean, default: true }, //对于clone，引用clone对象,当克隆对象修改值时，如果没有overrided，则顺带把跟踪他的所有值在数据库中修改掉。事务性。
        ownerTag: { type: Schema.Types.ObjectId, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag

    }
});
//create query index

CostClassRelationSchema.index({ "tracer.targetTag": 1, className: 1 }); //covered query
CostClassRelationSchema.index({ "tracer.owerTag": 1, name: 1, className: 1 }); //covered query

mongoose.model('CostClassRelation', CostClassRelationSchema);