/**
 * 
 * 不仅包含成本项的计算规则，也包括其他类别项计算规则，同样设计成可跟踪修改的模式
 * 
 *规则既是公式的保存，又是对结果的保存。显示模式显示ivalue，编辑模式显示公式。
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

const ruleDescriptorSchema = new Schema({ //统一为ruleformulariptor。包括计算规则，断言规则，等等。
    name: { type: String, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    ruleClass: {
        type: String,
        enum: ["D0", //字符型描述规则,
            "D1", //地区地址描述性规则,
            "D2", //时刻时间描述性规则，
            "D3", //普通数值规则
            "D4", //组合关系描述规则
            "D5", //普通Plain object
            "D6", //信息块
            "D7", //信息块组
            //
            "C1", //与bases没有层级关系，不存储iValue值，值是通过formula计算得来的。
            "C2", //与bases有层级关系，不存储iValue值，值是通过formula计算得来的。
            "C3", //是迭代变量，需提供iValue值作为默认值，没有默认为0
            "C4", //组合计算，
            "C5", //输入为接口对象{接口名词1:计算规则1，接口名词2：计算规则2}
        ]
    },
    ruleBases: [String],
    ruleFormula: String,
    ruleValue: {},
    tracer: {
        //       updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。没有意义。
        ownerTag: { type: String } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
const coreProject = { "tracer.ownerTag": 1, name: 1, "rule.bases": 1, "rule.formula": 1, "rule.iValue": 1 };
const coveredIndex = { "tracer.ownerTag": 1, name: 1, "rule.bases": 1, "rule.formula": 1, "rule.iValue": 1 };

ruleDescriptorSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
ruleDescriptorSchema.index(coveredIndex); //cover query



var RuleDescriptor = mongoose.model('RuleDescriptor', ruleDescriptorSchema);
RuleDescriptor.coreProject = coreProject;

/**
 *
 * 2017/04/27
 * rule 不仅要解决存储的问题，还要解决显示和编辑修改的问题。各种规则想要统一用一种face来存储似乎是不可能的。为了简化管理，将规则类别放到rule本身的定义中。
 * 1. rule类别，最基本的有描述性类别，譬如：项目名称 ，项目省市区等。对描述性规则依然要进行细分，因为不同的描述性规则，使用的显示和编辑方式不一样。如，项目名称，编辑只是简单的表单form.input,显示只是table-td；而地址的省市区，显示依然是table-td，但编辑确是form.select。
 * 2. 描述性规则，第二种，描述 组合规则，它的目的是将规则进行组合，譬如项目描述，规则本身不进行计算，只是将项目名称、项目地址、项目状态等规则进行组合。
 * 3. 时间规则等，也算是描述性规则。
 * 3. 描述规则最大的特点是不进行计算，
 * 
 * 计算规则中，也许会分为判定规则返回是否，迭代规则，迭代规则比较繁琐，因为它需要记录迭代退出的条件（这个有可能有很多）;，
 * 因此目前将rule分为几个大类，描述性规则D，计算性规则C，每个大类规则根据实际的规则，根据存储、计算、显示、编辑等原则的差异，分为各个小类
 * 
 * //
 * rule type 用于定义规则的类型，譬如，
 * 1. 普通规则C0：是指不需要计算的规则，即没有formula，没有bases的规则。
 * 1.1 普通规则C1：返回数值
 * 1.2 普通规则C2：返回字符串
 * 2. 判定规则P0，返回值为是，否
 * 3. 
 * 4. 计算规则A0，返回value 为number。
 *    计算规则A1，返回value为时间规则T0,返回时间对象，{startTime：xx,endTime:yy,style:"total",value:{}}}
 
 */