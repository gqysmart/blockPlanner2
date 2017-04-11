/**
 * 
 * 公共数据中心（public data swap center），存储和发布数据。
 * 数据发布:按app发布，例如由设计模块发布的计容面积，只能由设计模块来修改。其他模块只能读取。因此每个模块需要一个标识tag，每个方案有一个数据交换中心。
 * 暂时不考虑此功能。
 * 
 * pdc 主要复制解析计算规则并缓存计算结果。
 */

//init 从systemdb copy calc规则并修改initConfig，记录

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const PDCItem = mongoose.model("PDCItem");
const Accessor = mongoose.model("Accessor");
const calcRuleManger = require("./calcRule.manager.server");
const _ = require("lodash");
const dbMgr = require("./db.manager.server");
const sysConfig = require("../config/sys");





//重新计算时，最终肯定是收敛的。其他修改只是申请修改，但并不执行重新计算。为了防止无限循环，应该有几种机制让它能停下来，譬如循坏次数，时间，强制听下来。
//如果计算期间，修改了规则怎么处理？因为冲计算时间可能比较长，这期间发生修改的可能性是很大的。因此做如下修改：默认重计算次数改为10次；pdc控制字段添加recusive：{style:["times，during"] value：}
const defaultCalcAndPublishcontext = {
    reCalcNums: 32 //如果有迭代计算，默认为32次。
}

function* getCalcRuleValueFromPDC(pdcAccessorTag, calcRuleAccessorTag, calcRuleName) {
    var pdcAccessor = yield Accessor.findOne({ thisTag: pdcAccessorTag, version: sysConfig.version });
    var pdcItem = yield PDCItem.findOne({ "tracer.ownerTag": pdcAccessorTag, name: calcRuleName });
    if (!pdcItem) {
        //首先要lock住pdcAccessor，因为有可能会有其他需要添加的请求,lock calcrule,因为计算时如果有规则改变会影响结果。
        var context = {};
        var success = yield dbMgr.holdLockAndOper(pdcAccessorTag, async(function*() {
            yield calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, calcRuleName);
            //     var success = yield dbMgr.holdLockAndOper(calcRuleAccessorTag, async(function*() {
            //         return yield calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, calcRuleName);
            //     }), context);
            //     if (!success) {
            //         var err = { no: -1, desc: "calcRule is changing!" };
            //         throw (err);
            //     }
            // }), context);
            // if (!success) {
            //     var err = { no: -1, desc: `can't hold PDCAccessor=${pdcAccessorTag}.` };
            //     throw (err);

            // } else {
            //     return pdcItem.value;

            // }
        }));
    }

    function* calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, calcRuleName, context) {
        if (!context) { context = {} };
        _.defaults(context, defaultCalcAndPublishcontext);
        //
        var pdcAccessor = yield Accessor.findOne({ thisTag: pdcAccessorTag, version: sysConfig.version });
        if (!pdcAccessor) {
            var err = { no: -1, desc: `pdcAccessor=${pdcAccessorTag} doesn't exist.` }
            throw (err);
        }

        var ruleDesc = yield calcRuleManger.getCalcRuleDescriptor(calcRuleAccessorTag, calcRuleName);
        if (!ruleDesc) {
            var err = { no: -1, desc: `calcRuleName=${calcRuleName} doesn't exist.` }
            throw (err);
        }

        var bases = ruleDesc.rule.bases;
        var baseValues = [];
        if (bases && bases.length > 0) { //pdc locked?  //是否考虑添加重入锁，否则这里要考虑释放lock
            //先处理依赖项

            for (let i = 0; i < bases.length; i++) {
                var value = yield calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, bases[i]);
                if (!value) {
                    var err = { no: -1, desc: `calcRuleName=${base[i]} doesn't exist.` };
                    throw (err);
                }
                baseValues.push(value);
            }
        }

        function* applyRecalc(pdcAccessorTag, calcRuleAccessorTag, context) {
            if (!context) { context = {} };
            if (!context._reCalcTimes) { context._reCalcTimes = 0; }

            var pdcAccessor = yield Accessor.findOne({ thisTag: pdcAccessorTag, version: sysConfig.version });
            var calcRuleAccessor = yield Accessor.findOne({ thisTag: calcRuleAccessorTag, version: sysConfig.version });

            var appliedPDCItems = yield PDCItem.find({ "tracer.ownerTag": pdcAccessor.thisTag, applyRecalc: true }).toArray();
            if (appliedPDCItems.length === 0) { return true; }
            var appliedNames = [];
            for (let i = 0; i < appliedPDCItems.length; i++) {
                appliedNames.push(appliedPDCItems[i].name);
            }
            for (let i = 0; i < appliedPDCItems; i++) {
                let item = appliedPDCItems[i];
                var depsItems = yield getCalcRuleDescriptor.find({ "tracer.ownerTag": calcRuleAccessor.thisTag, name: { $in: appliedNames }, "rule.base": item.name }).toArray();
                for (let j = 0; j < depsItems.length; j++) {
                    let depItem = depsItems[i];
                    yield calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, context)
                }
                item.applyRecalc = false;
                yield item.save();
            }

            if (++context._reCalcTimes > context.reCalcNums) { return true; } else {
                return yield applyRecalc(pdcAccessorTag, calcRuleAccessorTag, context);
            }


        };
        //解析规则
        function* parseCalcRule(ruleDesc) {
            //解析规则
            var rOpers = /(.*)=(.*)/.exec(ruleDesc);
            var value = 0;
            switch (rOpers[1]) {
                case "AS": //auto sum,自动求和
                    value = _.sum(baseValues);
                    break;
                case "DN":
                    value = parseFloat(rOpers[2]);
                    break;
                case "AF": // 以后公式可能很复杂，公式解析,暂时用公式 例如{{1}}* {{2}}单元测试
                    value = baseValues[0] * baseValues[1];
                    break;
                case /^WS/.test(rOpers[1]): //web service
                    break;
            }
            return { err: null, value: value };
        };
        var parseResult = yield parseCalcRule(ruleDesc.rule.desc);
        if (!parseResult) {
            var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} parse value=null ` };
            throw (err);
        }

        //再次查询是否加锁
        //生成占用锁tag
        var _pdcItem = null;
        var oper = async(function*(context) {
            _pdcItem = yield PDCItem.findOne({ name: calcRuleName, "tracer.ownerTag": pdcAccessorTag });
            if (_pdcItem) { //是不是占用前已经被添加过了，如果已经有了该项，只是修改value值
                if (Math.abs(_pdcItem.value - parseResult) > 0.0001) { //精度0.0001
                    _pdcItem.value = parseResult;
                    _pdcItem.applyRecalc = true; //依赖项是现在重新计算？还是提示手动，应该还是修改lastmodifed time，让后续模块自行判断。
                    yield _pdcItem.save();
                    yield applyRecalc(pdcAccessorTag, calcRuleAccessorTag, context);
                    pdcAccessor.timemark.lastModified = Date.now();
                    yield pdcAccessor.save();
                    return true;
                }
            } else {
                _pdcItem = new PDCItem();
                _pdcItem.name = calcRuleName;
                _pdcItem.value = parseResult.value;
                _pdcItem.tracer.ownerTag = pdcAccessorTag;
                yield _pdcItem.save(); //这里应该要查找一下是不是在创建时，已经有其他的任务已经添加了该item的计算item
                return true;
            }
        });
        var success = yield dbMgr.holdLockAndOper(pdcAccessorTag, oper, context);


        if (success == true) {
            return _pdcItem.value;
        } else { return null; }
    }
};
module.exports.getCalcRuleValueFromPDC = async(getCalcRuleValueFromPDC);