/**
 * 
 * 不仅包含成本项的计算规则，也包括其他类别项计算规则，同样设计成可跟踪修改的模式
 * 原型继承的基本说明：
 * 1. 通过管理类实现原型继承，譬如pdc souceTag 指向查找顺序的上一个pdc ，知道sourceTag = null,sourceTag 为null，包含的pdcitem是从systemdb中拷贝过来的所有calcrule。这是用时间换空间的一种做法，先整体上指定拷贝的源，每个item项还是可以进行另指定源的修改。因为都是有cached，因此
 * 这在修改不是很频繁的时候是存储高效和使用高效的，实现空间与时间、跟踪功能的平衡。
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;

const Schema = mongoose.Schema;

/**
 * user schema
 */

const PDCItemSchema = new Schema({
    name: { type: String, required: true }, //calcrule 可能会根据类别通过ownertag分类存储calc规则。
    value: Number,
    //直接数的改变是修改的calcruledesc，recalc需要计算自己以及associated，可能是规则变了，依赖变了,申请重新计算自己 以及依赖
    applyRecalc: { type: Boolean }, //recalc时，所有喊有此项required的，都应重新计算
    tracer: {
        updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。
        ownerTag: { type: String, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index
//covered 重要的类型，cover查询
PDCItemSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
PDCItemSchema.index({ "tracer.ownerTag": 1, name: 1, applyRecalc: 1, value: 1 });

mongoose.model('PDCItem', PDCItemSchema);

// /**
//  *
//  *
//  */

"use strict";
const PDCItem = mongoose.model("PDCItem");