"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;
const sysConfig = require("../config/sys.js");

const Schema = mongoose.Schema;


const accessorSchema = new Schema({
    thisTag: { type: String }, //default: 
    version: { type: String, default: sysConfig.version },
    category: String, //也许以后就可以不同的类别存储到不同的集合中。如ruleAccessor，incubatorAccessor等。目前放在一起。
    // 形成信息分类。类似于植物分类：kingdom-phylum-class-order-family等细分。目前按规则类可以细分为：项目、设计、财务等等规则。写时拷贝只需要拷贝一部分。
    proto: {
        writeOnCopy: false, //写时拷贝为true，表示这个accessor 的item已经为它的backward专用了。原先的owner在修改时需要你要写时，必须要复制一份里面的内容。原型链因为是硬盘存储，不能太长，不然效率差。用空间换时间。原型链的长度和效能的平衡可以通过控制Accessoritem的数量来控制，譬如每个accessor中items不能超过5000，这个copy insert
        //5000个数据的延迟如果是可以接受的，是需要根据实际的数据库的效能观察得出。。
        forward: { type: String }, //1..n，原型链是无穷长的，关联对象的深度是1
        //     association: { type: Schema.Types.ObjectId } //关联对象，查找时先找自身，如果自身没有，要先去关联对象查找修改。关联对象的意义好像不大,而且增加了很多的复杂性，还是取消。
    },
    concurrent: { //可以控制并行操作。
        token: { type: String } //保存口令创建时间，必要时根据时间可以强行删除口令
    },
    security: {
        readLevel: { type: Number, min: 0, max: 999, default: 500 }, //高于此level才能访问
        writeLevel: { type: Number, min: 0, max: 999, default: 500 }, //高于此level才能访问
    },
    tracer: {
        ownerTag: { type: String }
    },
    log: {
        accessorTag: { type: String }
    },
    timemark: {
        lastModified: { type: Date }, //访问器内文件新建或者如果发生了变化，修改此时间
        forwardUpdated: { type: Date }, //新建或者修改forward链之后，需要修改此事件，如果小于原型的lastmodifiedtime，说明原型的规则发生了变化，重新计算后，修改为目前时间。
    },

    special: {},

});
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
//accessor 是比较重要的数据结构，查询和访问应采用cover方式。thisTag目前采用objectID是唯一的，升级产品时可能会copy这个accessorTag 可能是不唯一的。
accessorSchema.index({ thisTag: 1, version: 1 }, { unique: true });
accessorSchema.index({
    thisTag: 1,
    version: 1,
    "proto.forward": 1,
    "proto.writeOnCopy": 1,
    timemark: 1,
    concurrent: 1
}); //覆盖查询

mongoose.model('Accessor', accessorSchema);