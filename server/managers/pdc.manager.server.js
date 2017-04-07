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
const PDC = mongoose.model("PDC");
const CalcRule = mongoose.model("CalcRule");
const calcRuleManger = require("./calcRule.manager.server");
const _ = require("lodash");



module.exports.createPDC = async(function*(cb) {
    //pdc 职能通过plan访问。因此没有owner字段。
    var newPDC = new PDC();
    newPDC.thisTag = new ObjectID();
    var pdc = yield newPDC.save();
    if (cb) { cb(null, pdc.toObject()) };

});

function* applyRecalc(pdcID, name, cb) {
    var pdc = yield PDC.findOne({ _id, pdcID });
    var pdcItem = null;
    if (pdc.access.locked === true) {
        //不进行修改，返回报错信息，提示强行停止或者放弃修改
    } else {
        try {
            pdc.access.locked = true;
            yield pdc.save();
            //oper
            pdcItem = yield PDCItem.findOneAndUpdate({ "tracer.ownerTag": pdc.thisTag, name: name }, { applyRecalc: true });

        } catch (e) {

        } finally {
            pdc.access.locked = false;
            yield pdc.save();
        }

    }
    if (cb) {
        cb(null, pdcItem.toObject());
    }
};
module.exports.applyRecalc = async(applyRecalc);

//重新计算时，最终肯定是收敛的。其他修改只是申请修改，但并不执行重新计算。为了防止无限循环，应该有几种机制让它能停下来，譬如循坏次数，时间，强制听下来。
//如果计算期间，修改了规则怎么处理？因为冲计算时间可能比较长，这期间发生修改的可能性是很大的。因此做如下修改：默认重计算次数改为10次；pdc控制字段添加recusive：{style:["times，during"] value：}
function* getData(criteria) { //criteria 应该包含planID的，根据planID才能查到pdcID，calcID等。 暂时以这个单元测试。系统整合时再调整。
    var pdcID = criteria.pdcID;
    var name = criteria.name;
    var pdc = yield PDC.findOne({ _id, pdcID });
    var pdcItem = yield PDCItem.findOne({ "tracer.ownerTag": pdc.thisTag, name: name });
    if (!pdcItem) {

        pdcItem = yield calcAndPublish(criteria);
        if (!pdcItem) {
            return null;
        }
    }
    return pdcItem.value;
};
module.exports.getData = async(getData);


function* calcAndPublish(criteria) {
    var pdcID = criteria.pdcID;
    var name = criteria.name;
    //
    var pdc = yield PDC.findOne({ _id, pdcID });
    var pdcItem = null;
    //
    var calcRuleID = options.calcRuleID;
    var ruleDesc = yield calcRuleManger.getCalcRuleDescriptor(calcRuleID, name);
    if (!ruleDesc) {
        var err = { no: -1, desc: `no define ${name} calcruledescritor.` };
        return null;
    }
    var bases = ruleDesc.rule.base;
    var baseValues = [];
    if (bases && bases.length > 0) { //pdc locked?  //是否考虑添加重入锁，否则这里要考虑释放lock
        //先处理依赖项

        for (let i = 0; i < bases.length; i++) {
            var crit = { pdcID: pdcID, name: bases[i], calcRuleID: calcRuleID };
            var value = yield getData(crit);
            if (!value) {
                return null;
            }
            baseValues.push(value);
        }
    }


    //解析规则
    var parseResult = yield co(parseCalcRule(ruleDesc.rule.desc));
    if (parse.err) {
        return null;
    }

    //再次查询是否加锁
    //生成占用锁tag
    var operOptions = {
        cb: async(function*() {
            var _pdcItem = yield PDCItem.findOne({ name: name });
            if (_pdcItem) {
                pdcItem = _pdcItem;
                return;
            } else {
                pdcItem = new PDCItem();
                pdcItem.name = name;
                pdcItem.value = parseResult.value;
                pdcItem.tracer.ownerTag = pdc.thisTag;
                yield pdcItem.save(); //这里应该要查找一下是不是在创建时，已经有其他的任务已经添加了该item的计算item
                retrun;
            }
        })
    };
    var success = yield co(holdLockAndOper(PDC, pdcID, operOptions));

    if (success) { return pdcItem; } else { return null; }
}

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
    }
    //editCtl 是指类似calcRule，pdc，的文档id，通过他们才能去写pdcitem，calcruledescriptor。
    //具有通用性，作为通用修改锁，不是线程的，是用hostTag来实现锁，因此多线程，多进程，多并发都是可以用的。
var defaultHoldOptions = {
    maxLagTime: 1000 //一秒
};

function* holdLockAndOper(model, editCtlId, operOptions) { //调整到db.manager作为通用锁访问，相应的组件有access{}；schema支持继承么？
        function pause(time) {
            var promise = new Promise(function(resolve, reject) {
                setTimeout(function() { resolve() }, time);
            })
        };
        if (!operOptions) { operOptions = {}; };
        operOptions = _.defaults(operOptions, defaultHoldOptions);
        if (!operOptions._startTime) { operOptions._startTime = new Date() };
        //
        var myAccessTag = new ObjectID();
        var ctl = yield model.findOne({ _id, editCtlId }); //为了真正实现线程锁，还需要添加占用锁定的ID，可用objectID。
        if (!ctl.access.hostTag) {
            ctl.access.hostTag = myAccessTag;
            yield pdc.save();
            //重新查找一次，确认目前是自己占用了锁。
            ctl = yield PDC.findOne({ _id, pdcID });
            if (ctl.access.hostTag !== myAccessTag) {
                var now = new Date();
                if (now.getTime() - operOptions._startTime.getTime() > operOptions.maxLagTime) { return false } //操作失败。
                else { //尝试随机时间后，再尝试修改
                    operOptions._startTime = new Date();
                    var randomPauseTime = Math.random() * 500; //0.5秒以内，重新尝试一次。
                    yield pause(randomPauseTime);
                    yield co(holdLockAndOper(model, editCtlId, operOptions));
                }

            } else { //hold
                try {
                    if (operOptions.cb) {
                        cb();
                    }

                } catch (e) {

                } finally {
                    //释放lock
                    ctl.access.hostTag = null;
                    yield ctl.save();

                }


            }

            return true;
        }