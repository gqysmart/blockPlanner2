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
const exceptionMgr = require("./exception.manager.server");






//重新计算时，最终肯定是收敛的。其他修改只是申请修改，但并不执行重新计算。为了防止无限循环，应该有几种机制让它能停下来，譬如循坏次数，时间，强制听下来。
//如果计算期间，修改了规则怎么处理？因为冲计算时间可能比较长，这期间发生修改的可能性是很大的。因此做如下修改：默认重计算次数改为10次；pdc控制字段添加recusive：{style:["times，during"] value：}
const defaultCalcAndPublishcontext = {
    $_reCalcNums: 32, //如果有迭代计算，默认为32次。
    $_doubleThreshold: 0.001 //浮点误差限

}


function* getCalcRuleValueFromPDCWithoutThrow(incubatorAccessorTag, incubatorName, targetRuleName, options) {

    var context = {}; //构建context
    context.targetRule = targetRuleName; //真正需要计算的规则
    if (options.reCalcNums) {
        context.$_reCalcNums = options.reCalcNums;
    }
    if (options.threshold) {
        context.$_doubleThreshold = options.threshold;
    }
    _.defaults(context, defaultCalcAndPublishcontext);

    //
    var incubator = yield dbMgr.incubator.getIncubatorCoreInEditable(incubatorAccessorTag, incubatorName);
    var pdcAccessorTag = incubator.container.PDCAccessorTag;
    var pdcAccessorInEditableOnlySpecial = yield dbMgr.accessor.getAccessorOnlySpecialInEditable(pdcAccessorTag);
    if (pdcAccessorInEditableOnlySpecial.special && pdcAccessorInEditableOnlySpecial.special === "COMPUTING") {
        return yield doStaleQuery();
    }

    try { //锁定前，先查看PDC是不是正在计算，如果正在计算则查看是否有过期的数据，如果没有，返回带有err的对象

        var value = dbMgr.holdLockAndOperWithAssertWithThrow(incubatorAccessorTag,
            async(function*() { //防止 修改incubator的container，strategy
                var incubator = yield dbMgr.incubator.getIncubatorCoreInEditable(incubatorAccessorTag, incubatorName); //重新查询，获得新值
                context.$_collectAllRelationalRule = true;
                context.$_possibleRelationalRules = {};
                yield doGetRuleValueFromPDC(incubator.container.PDCAccessorTag, incubator.strategy.calcRuleAccessorTag, targetRuleName, context)
                context.$_collectAllRelationalRule = false;


            }), contxt);
    } catch (e) {

        //如果是因为占用超时，还是要返回查询结果
        switch (e.no) {
            case holdAccessorException:
            default:
                return yield doStaleQuery();

        }
    }

    function* doStaleQuery() {
        var pdcItem = yield dbMgr.PDCItem.getPDCItemCoreEditable(pdcAccessorTag, targetRuleName);
        if (pdcItem) {
            return { value: pdcItem.value, err: null, stale: true };
        } else {
            return { value: null, err: "system is busy!" }
        }

    };

    function* doGetRuleValueFromPDC(pdcAccessorTag, calcRuleAccessorTag, ruleName, context) {
        if (context.$_collectAllRelationalRule) {

        }

        //计算时如果发生异常 怎么处理 ？？ 
        /**
         * 算法说明：采用正向 按依赖深度的依次迭代；（因为PDC目前设计，并不是针对数值计算的，并没有用到数值计算库，只能是简单运算，后续可能会独立形成pdc服务器中心。对于不可能改变的规则进行收集，如日期等等。。）
         * 1. pdc是内存运算，不进行永久保存（note：但每次都需要解析很多没意义的直接数，似乎有些浪费），不设置pdcItems永久保存，是因为不能保证计算时pdc中的数据是按照规定计算出来的数值，譬如达到了重新约定的迭代次数。即使是直接数，也可能是依赖条件中的一部份。
         * 2. pdc的效能是很大的问题，以后也许会采用多核并行运算解决。
         * 3. 是否需要在pdc中进行重新计算，还是应该根据record中的时间和ruleaccessor的时间规则来确定，只要有一项规则发生了变化，就需要重新计算，重点记录record时间长，一般记录时间短，由后台进程进行删除维护。
         * 4. JS的对象查找是高效的， 为了减少内存pdc内存结构要精简，
         * //关于依赖闭环和迭代
         * 1. a——》b——》c
         *    a《-------c         a依赖b，b依赖c，c又依赖a，产生依赖闭环；
         * 2. 依赖闭环是允许的，也是进行迭代运算的前提。
         * 3. 如果产生了依赖闭环，通过迭代的方式去解决计算问题。迭代执行的顺序为按深度优先迭代，同深度按声明次序优先。
         * a-》b,c,d 
         * b->e,f,a, b反向依赖a，
         * 4.迭代运算为先根据依赖优先的方式计算cd，b因为有反向依赖所以必须向a索要计算值，a此时正处于pending挂起状态，取规则中的init值传递给b，同时将b加入到a的反向依赖对象中。将a登记到有反向规则的优先级队列中。完成一次迭代。
         * 对于init值的选取，是个讨厌的事，很难让客户能明白，如果统一默认取0，有可能会出现0除异常；但是初始值的选取对于迭代非常重要，属于高阶控制数据，要不要开放到规则定义里，是要考虑的。
         * 规则的格式可能为：rule.desc AC={{1}}*{{2}}=initValue，如果没有initValue，就取0，如果0除就报异常，让客户自己处理。
         * 
         * 5.查询有反向依赖的优先级列表，如果不为空。说明rootrule的计算中，是有依赖闭环的。从优先级列表中，找到优先级最高的 a的依赖深度最小，迭代优先级最高。根据新值和a的反向依赖列表从a重新计算b，此时b重新计算过了，对他有反向依赖的必然要重新计算一次。
         * 根据优先级反向列表完成计算后，表明一次迭代完成，重复计算该迭代。
         * 6.迭代退出条件，
         * a.如果莫一规则两次迭代计算值小于浮点运算的threshold中，一般设为0.0001，（为了增加精度，规则可以换算了较小的单位，如亿元换为千万。），将status改为2（pending 为1），如果所有有反向依赖的规则status变为1，就退出迭代；
         * b.指定迭代次数，如果迭代超过默认为32次，退出。
         * c.指定退出条件，属于高阶功能。
         * pdc的内存结构为{ruleName:{value:23,status:pending,initvalue:0,depth:1,backWardBases:{无序要求的ruleName}},rulename2:{}....},
         * 辅助结构：loopBases={currentdepth:1,list:【】}0:[],优先级为0的被反向依赖的rule。1：优先级为1的被反向依赖的rule，根据深度依次增加优先级。若depth大于currentdepth，就增加一个等优先级【】。
         * depths =【】，0，rootrule，1，root-》bases ，2，root-》bases-》bases
         * 
         */
        //hold pdc
        yield dbMgr.holdLockAndOperWithAssertWithThrow(pdcAccessorTag,
            async(function*() {
                var pdcAccessorEditableOnlySpecial = yield dbMgr.accessor.getAccessorOnlySpecialEditable(pdcAccessorTag);
                var pdcItem = yield dbMgr.PDCItem.getPDCItemCoreEditable(pdcAccessorTag, ruleName);
                if (!pdcItem) {
                    return yield dbMgr.holdLockAndOperWithAssertWithThrow(calcRuleAccessorTag), async(function*() { //hold rule,不运行计算时，改变规则。
                        try {
                            yield dbMgr.accessor.updateAccessorOnlySpecial(pdcAccessorEditableOnlySpecial, { status: "COMPUTING" });
                            return yield calcAndPublish(ruleName);
                        } catch (e) {
                            throw (e);
                        } finally {
                            yield dbMgr.updateAccessorOnlySpecial(pdcAccessorEditableOnlySpecial, { status: "OK" });
                        }
                    }, context);
                } else {
                    return pdcItem.value;
                }
            }), context);

    };

    function* calcAndPublish(ruleName) {
        //
        var ruleDesc = yield dbMgr.ruleDescriptor.getRuleDescriptorCoreInEditable(calcRuleAccessorTag, ruleName);
        var bases = ruleDesc.rule.bases;
        var baseValues = [];
        if (bases && bases.length > 0) {
            //先处理依赖项
            for (let i = 0; i < bases.length; i++) {
                var value = yield doGetCalcRuleValueFromPDC(pdcAccessorTag, calcRuleAccessorTag, bases[i], context);
                baseValues.push(value);
            }
        }

        var parseResult = yield parseCalcRule(ruleDesc.rule.desc);

        var _pdcItem = yield dbMgr.PDCItem.getPDCItemCoreEditable(pdcAccessorTag, ruleName);
        if (_pdcItem) { //是不是占用前已经被添加过了，如果已经有了该项，只是修改value值
            if (Math.abs(_pdcItem.value - parseResult) > context.$_doubleThreshold) { //精度0.0001
                _pdcItem.value = parseResult;
                yield _pdcItem.save();

            }
        } else {
            _pdcItem = yield dbMgr.PDCItem.getNewPDCItemEditable();
            _pdcItem.name = ruleName;
            _pdcItem.value = parseResult;
            _pdcItem.tracer.ownerTag = pdcAccessorTag;
            yield _pdcItem.save(); //
        }

        //       var success = yield dbMgr.holdLockAndOperWithAssertWithThrow(pdcAccessorTag, oper, context);

        return _pdcItem.value;
        //解析规则
        function* parseCalcRule(ruleDesc) {
            function* getValueByWebService(timetout) {
                return null;
            };
            //解析规则
            var rOpers = /(.*)=(.*)/.exec(ruleDesc);
            var value = null;
            switch (rOpers[1]) {
                case "AS": //auto sum,自动求和
                    try {
                        value = _.sum(baseValues);
                        return value;

                    } catch (e) {
                        var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} autoSum wrong.` };
                        throw (err);

                    }

                    break;
                case "DN":
                    try {
                        value = parseFloat(rOpers[2]);
                        if (value === Number.NaN) { //这里判断要注意返回是null 还是false，因为value 是可以等于false的。
                            var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} is not a Number.` };
                            throw (err);
                        }
                        return value;
                    } catch (e) {
                        var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} parseFloat error.` };
                        throw (err);
                    }

                    break;
                case "AF": // 以后公式可能很复杂，公式解析,暂时用公式 例如{{1}}* {{2}}单元测试
                    try {
                        value = baseValues[0] * baseValues[1];
                        if (value === null) { //这里判断要注意返回是null 还是false，因为value 是可以等于false的。
                            var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} formula exec wrong.` };
                            throw (err);

                        }
                        return value;

                    } catch (e) {

                        var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} formula exec wrong.` };
                        throw (err);

                    }

                    break;
                case /^WS/.test(rOpers[1]): //web service
                    value = yield getValueByWebService(5000);

                    if (value === null) { //这里判断要注意返回是null 还是false，因为value 是可以等于false的。
                        var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} web services timeout.` };
                        throw (err);

                    }
                    return value;
                    break;
                default:
                    var err = { no: -1, desc: `rule.desc=${ruleDesc.rule.desc} no matched algrithm.` };
                    throw (err);

            }

        };
    };
};





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
            yield calcAndPublish(pdcAccessorTag, calcRuleAccessorTag, depItem.name, context)
        }
        item.applyRecalc = false;
        yield item.save();
    }

    if (++context._reCalcTimes > context.$_reCalcNums) { return true; } else {
        return yield applyRecalc(pdcAccessorTag, calcRuleAccessorTag, context);
    }

};
module.exports.getCalcRuleValueFromPDC = async(getCalcRuleValueFromPDC);