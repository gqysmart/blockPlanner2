/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const PDCMgr = require("./pdc.manager.server");
const dbMgr = require("./db.manager.server");
const exceptionMgr = require("./exception.manager.server");
const calcRuleMgr = require("./rule.manager.server");
const recordMgr = require("./record.manager.server");
const constants = require("./constants.manager.server");
const sysConfig = require("../config/sys");
const termMgr = require("./terminology.manager.server");
const cryptMgr = require("./crypt.manager.server");

const Accessor = mongoose.model("Accessor");
const Incubator = mongoose.model("Incubator");
const InitConfig = mongoose.model("InitConfig");
const Record = mongoose.model("Record");
var incubatorManager = {

};
module.exports = incubatorManager;
incubatorManager.createIncubator = async(createIncubator);

function* getUniqIncubatorName() {
    return new ObjectID();
}
module.exports.createIncubator = async(createIncubator);

function* createIncubator(incubatorInfo, ruleAccessorTag, incubatorAccessorTag) {

    var newincubator = new Incubator(incubatorInfo);
    if (!incubatorAccessorTag) {
        var incubatorAccessor = new Accessor();
        yield dbMgr.initIncubatorAccessor(incubatorAccessor);
        yield incubatorAccessor.save();
        incubatorAccessorTag = incubatorAccessor.thisTag;
    }
    newincubator.tracer.ownerTag = incubatorAccessorTag;
    //
    var pdcAccessor = new Accessor();
    yield dbMgr.initPDCAccessor(pdcAccessor);
    yield pdcAccessor.save();

    var recordAccessor = new Accessor();
    yield dbMgr.initRecordAccessor(recordAccessor);
    yield recordAccessor.save();

    if (!ruleAccessorTag) {
        var calcRuleAccessor = yield calcRuleMgr.createCalcRules();
        ruleAccessorTag = calcRuleAccessor.thisTag;
    }

    newincubator.name = yield getUniqIncubatorName()
    newincubator.strategy.ruleAccessorTag = ruleAccessorTag;
    newincubator.container.PDCAccessorTag = pdcAccessor.thisTag;
    newincubator.container.recordAccessorTag = recordAccessor.thisTag;

    yield newincubator.save();
    return newincubator;
};

function* transferRuleName2Category(ruleName) {
    // return ruleName.toString();
    return ruleName;
};
module.exports.transferRuleName2Category = async(transferRuleName2Category);
module.exports.getEnvironmentFromIncubator = async(getEnvironmentFromIncubator);

function* getEnvironmentFromIncubator(incubator) {
    // return incubator.strategy.ruleAccessorTag.toString();
    return incubator.strategy.ruleAccessorTag;

}
module.exports.getRecordFromIncubatorByRuleTerminologyTag = async(getRecordFromIncubatorByRuleTerminologyTag);

function* getRecordFromIncubatorByRuleTerminologyTag(incubatorAccessorTag, incubatorName, ruleTerminologyTag, context) {

    if (!context) { context = {} };
    _.defaults(context, defaultCostHierarchyRecordOptons);

    var category = yield transferRuleName2Category(ruleTerminologyTag);
    var incubatorAccessor = yield Accessor.findOne({ thisTag: incubatorAccessorTag, version: sysConfig.version });
    var incubator = yield Incubator.findOne({ "tracer.ownerTag": incubatorAccessor.thisTag, name: incubatorName });
    var environment = yield getEnvironmentFromIncubator(incubator);
    var existRecord = yield Record.findOne({
        "tracer.ownerTag": incubator.container.recordAccessorTag,
        "record.category": category,
        "record.environment": environment
    });
    if (!existRecord) {
        //不存在重新计算，并record。,不需要二次查询。
        existRecord = yield _getCalcRuleValueFromPDCWithThrow(incubatorAccessorTag, incubatorName, ruleTerminologyTag);

        return existRecord.value;
    } else {
        //存在查看记录时间和规则修改的时间，是否记录已经过时。
        var calcRuleAccessor = yield Accessor.findOne({ thisTag: incubator.strategy.ruleAccessorTag, version: sysConfig.version });
        if (existRecord.tracer.updatedTime < calcRuleAccessor.lastModified || existRecord.tracer.updatedTime < calcRuleAccessor.forwardUpdated) {
            //重新计算并记录
            //不存在重新计算，并record。,不需要二次查询。
            existRecord = yield _getCalcRuleValueFromPDCWithThrow(incubatorAccessorTag, incubatorName, ruleTerminologyTag);
            return existRecord;

        } else { //记录存在且最新，将记录返回。
            //查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
            return existRecord.record.data
        }
    }

    function* laborAndRecord() {
        var terminologyAccessorTagCfg = yield InitConfig.findOne(dbMgr.terminologyAccessorTagCfgCriteria);
        var content = yield constructHierarchy(ruleTerminologyTag, incubator.container.PDCAccessorTag, incubator.strategy.ruleAccessorTag, terminologyAccessorTagCfg.value);
        var data = {
            body: content
        };
        var record = yield recordMgr.record(data, category, environment, incubatorAccessorTag, incubatorName);
        if (!record) {
            var err = { no: -1, desc: `recordd errored.` }
            throw (err);
        }

        return record;
    };


};
//对于新建方案可以使用写时再复制的方法。第一个方案新建后，后面的方案都是对原方案的引用。



function* constructHierarchy(rootCalcRuleName, pdcAccessorTag, ruleAccessorTag, terminologyAccessorTag) {
    var calcRuleDescriptor = yield calcRuleMgr.getCalcRuleDescriptor(ruleAccessorTag, rootCalcRuleName);
    if (!calcRuleDescriptor) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName}'s calcRule descriptor.` };
        throw (err);
    }
    var value = yield PDCMgr.getCalcRuleValueFromPDC(pdcAccessorTag, ruleAccessorTag, rootCalcRuleName);
    if (null === value) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName} data from PDC.` };
        throw (err);
    }

    var qualifiedName = yield termMgr.terminologyTag2QualifiedName(rootCalcRuleName, terminologyAccessorTag);

    var node = {
        name: {
            tag: rootCalcRuleName,
            qualified: qualifiedName,
        },
        calcRuleDes: calcRuleDescriptor.rule.desc,
        value: value,
        bases: []
    };
    var bases = calcRuleDescriptor.rule.bases;
    for (let i = 0; i < bases.length; i++) {
        let childObject = yield constructHierarchy(bases[i], pdcAccessorTag, ruleAccessorTag, terminologyAccessorTag);
        node.bases.push(childObject);
    }
    return node;
};

const defaultCostHierarchyRecordOptons = {
    duration: 2 * 365, //unit is day，默认为2天
    style: "cover" //[cover,keep:n]
};


//重新计算时，最终肯定是收敛的。其他修改只是申请修改，但并不执行重新计算。为了防止无限循环，应该有几种机制让它能停下来，譬如循坏次数，时间，强制听下来。
//如果计算期间，修改了规则怎么处理？因为冲计算时间可能比较长，这期间发生修改的可能性是很大的。因此做如下修改：默认重计算次数改为32次；pdc控制字段添加recusive：{style:["times，during"] value：}
const defaultCalcAndPublishcontext = {
    $_reCalcNums: 32, //如果有迭代计算，默认为32次。
    $_doubleThreshold: 0.0001, //浮点误差限
    $_saveRecord: true

}

module.exports.getCalcRuleValueFromPDCWithThrow = async(_getCalcRuleValueFromPDCWithThrow);

function* _getCalcRuleValueFromPDCWithThrow(incubatorAccessorTag, incubatorName, targetRuleName, options) {

    var context = {}; //构建context
    //真正需要计算的规则
    if (options && options.reCalcNums) {
        context.$_reCalcNums = options.reCalcNums;
    }
    if (options && options.threshold) {
        context.$_doubleThreshold = options.threshold;
    }
    if (options && optins.noSave) {
        context.$_saveRecord = !options.noSave;
    }
    _.defaults(context, defaultCalcAndPublishcontext);

    // var incubator = yield dbMgr.incubator.getIncubatorCoreInEditable(incubatorAccessorTag, incubatorName);
    var incubator = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(incubatorAccessorTag, { name: incubatorName });
    if (!incubator) {
        var err = {
            no: exceptionMgr.incubatorNotExistException,
            context: { incubator: incubatorName }
        };
        throw err;
    }
    var pdcAccessorTag = incubator.container.PDCAccessorTag;
    var ruleAccessorTag = incubator.strategy.ruleAccessorTag;
    var pdcAccessorInEditableOnlySpecial = yield dbMgr.getAccessorEditableOnlySpecialWithThrow(pdcAccessorTag);
    var busyPDCNums = yield dbMgr.itemsCountInAccessorWithThrow(pdcAccessorTag, { "status": "BUSY" });
    if (busyPDCNums >= pdcAccessorInEditableOnlySpecial.special.maxPDC) {
        return {
            value: null,
            status: constants.systemStatus.systemIsBusy
        };
    } else {

        var pdc = yield _doGetRulePDCWithThrow();
        if (!pdc) {
            return {
                value: null,
                status: constants.systemStatus.systemIsBusy
            }
        }
        var formatedData = yield formatPDCData(targetRuleName, pdc);
        if (context.$_saveRecord === true) {
            //save to record
        }
        return {
            value: formatedData,
            status: null
        };

    };

    function* _doGetRulePDCWithThrow() {
        var workingPDC = null;
        try {
            workingPDC = yield dbMgr.holdLockAndOperWithAssertWithThrow(pdcAccessorTag, //try hold and get a pdc.
                async(function*() {
                    var busyPDCNums = yield dbMgr.itemsCountInAccessorWithThrow(pdcAccessorTag, { "status": "BUSY" });
                    if (busyPDCNums >= pdcAccessorInEditableOnlySpecial.special.maxPDC) {
                        //hold之前pdc已经改变了，返回系统忙。
                        return null;
                    } else { //有可用的pdc资源

                        var PDCItemsCount = yield dbMgr.itemsCountInAccessorWithThrow(pdcAccessorTag);
                        if (PDCItemsCount >= pdcAccessorInEditableOnlySpecial.special.maxPDC) {
                            yield dbMgr.keepItemsCountInAccessorBelowWithThrow(pdcAccessorTag, {},
                                pdcAccessorInEditableOnlySpecial.special.maxPDC, { "tracer.updatedTime": 1 });
                            var idleItems = yield dbMgr.firstNSortedItemsCoreEditableInAccessorWithThrow(pdcAccessorTag, { status: "IDLE" }, 1, { "tracer.updatedTime": 1 });
                            idleItems[0].status = "BUSY"; //占用
                            idleItems[0].name = targetRuleName;
                            return yield idleItems[0].save();
                        } else {
                            var idleItem = yield dbMgr.newItemEditableInAccessorWithThrow(pdcAccessorTag);
                            idleItem.status = "BUSY"; //占用
                            idleItem.name = targetRuleName;
                            return yield idleItem.save();
                        }
                    }
                }), context);


            if (!workingPDC) {
                //
                var _PDC = null;
                return _PDC;
            } else {
                //computing in this pdc
                //first should lock strategy.
                var _PDC = {};
                _PDC.$_PDC = {
                    $forwardBasesMaxDepth: 0,
                    $totalRulesNum: 0,
                    $rulesHasBackwardBases: {
                        $$nums: 0,
                        addIn: function(rule) {
                            if (!this[rule.name]) {
                                this.$$nums++;
                                this[rule.name] = rule;
                            }
                        },
                        totalNums: function() {
                            return this.$$nums;
                        }
                    },
                    $rootRule: null,

                    //其他元数据
                    $completeFor: {} //因为什么规则完成了本次计算，譬如迭代次数，浮点运算阈值，其他给予的限定条件。
                };

                context.$_depth = 0;

                if (!context.$_i0) {
                    context.$_i0 = 0; //如果没有给定初始迭代值时的，默认初始值。
                }
                yield _doHoldRuleAccessorAndDoRun(ruleAccessorTag, targetRuleName, context, _PDC); //_PDC,
                return _PDC;

            }

        } catch (e) {
            throw e;
        } finally {
            if (workingPDC) {
                workingPDC.status = "IDLE";
                yield workingPDC.save();
            }
        };
        //
        function* _doHoldRuleAccessorAndDoRun(ruleAccessorTag, targetRuleName, context, _PDC) { //减少路径长度，提高效能
            var pdcMeta = _PDC.$_PDC;
            try {
                yield dbMgr.holdLockAndOperWithAssertWithThrow(ruleAccessorTag, async(function*() {

                    yield _firstRunInPDC();
                    pdcMeta.$rootRule = _PDC[targetRuleName]; //保留根规则元数据。


                    if (pdcMeta.$rulesHasBackwardBases.totalNums() > 0) { //如果有反向依赖就迭代计算
                        context._hasBackWardBases = true;
                        yield _recursiveRunInPDC(_PDC);
                    } else {

                        pdcMeta.$completeFor["rulename"] = {
                            name: "xx",
                            desc: "rule:/NORECURSIVE" //自定义规则 同ruledescriptor,计算规则，约束规则=返回bool的计算规则
                        };
                    }

                }), context);

            } catch (e) {
                throw e;
            }



            function* _firstRunInPDC() {

                yield _doFirstRunInPDC(targetRuleName);

                function* _doFirstRunInPDC(ruleName) {

                    if (!_PDC[ruleName]) {
                        var ruleDesc = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(ruleAccessorTag, { name: ruleName });
                        if (!ruleDesc) {
                            //如果规则不存在
                            var err = { no: exceptionMgr.ruleNotExistException, context: { rule: ruleName } };
                            throw err;
                        }
                        var forwardBases = ruleDesc.rule.bases;
                        var PDCItem = {
                            name: ruleDesc.name, //是否要保持
                            status: 0, //0 表示等待前向依赖完成，即pending状态；1：表示完成计算 ；和依赖深度等级好像重复了。
                            formula: ruleDesc.rule.formula,
                            depth: context.$_depth, //依赖深度
                            forwardBases: forwardBases, //前向依赖列表
                        };
                        if (ruleDesc.iValue) {
                            PDCItem["value"] = ruleDesc.iValue;
                        } else {
                            PDCItem["value"] = 0; //如果没有初始值，初始迭代初始值为0；
                        }
                        _PDC[ruleName] = PDCItem;
                    }


                    var rulePDCItem = _PDC[ruleName];
                    var pdcMeta = _PDC.$_PDC;

                    if (context.$_depth > pdcMeta.$forwardBasesMaxDepth) {
                        pdcMeta.$forwardBasesMaxDepth = context.$_depth;
                    }
                    context.$_depth += 1;
                    var baseValues = [];

                    //先处理依赖项
                    var bases = rulePDCItem.forwardBases;
                    for (let i = 0; i < bases.length; i++) {
                        var baseName = bases[i];
                        var existBaseRule = _PDC[baseName];
                        if (existBaseRule) {
                            if (existBaseRule.status === 0) { //反向依赖；正处于挂起状态
                                if (existBaseRule.value) {
                                    baseValues[i] = existBaseRule.value;
                                } else {
                                    baseValues[i] = context.$_i0;
                                }
                                _PDC.$_PDC.$rulesHasBackwardBases.addIn(existBaseRule);
                                existBaseRule.backwardBases = {};
                                existBaseRule.backwardBases[baseName] = _PDC[baseName];
                            } else {
                                baseValues[i] = existBaseRule.value;
                            }
                        } else { //还没计算过
                            yield _doFirstRunInPDC(baseName);
                            baseValues[i] = _PDC[baseName].value;

                        }

                    }
                    context.$_depth -= 1;
                    pdcMeta.$totalRulesNum += 1;
                    var parseResult = yield sandBoxEval(rulePDCItem.formula, _PDC);
                    rulePDCItem.status = 1;
                    rulePDCItem.value = parseResult;
                }; //end _doFirstRunInPDC

            };

            function* _recursiveRunInPDC(PDC) { //纯内存操作，适当的时候要释放控制权，增加吞吐。
                for (let i = 0; i < context.$_reCalcNums; i++) {
                    var applyStopNums = 0;

                    yield _doForwardScanAllRecursiveRunInPDC(targetRuleName); //效率是比较低的，因为可能为了几个内部的迭部要重新计算全部的相关项。


                    if (applyStopNums >= PDC.$_PDC.$totalRulesNum) { //如果全部规则都申请停止迭代计算，
                        break;
                        PDC.$_PDC.$completeFor = {};
                    }

                }

                function* _doForwardScanAllRecursiveRunInPDC(ruleName) {
                    var pdcObject = _PDC[ruleName];
                    pdcObject.status = 0;
                    var bases = pdcObject.forwardBases;
                    var baseValues = [];

                    for (let i = 0; i < bases.length; i++) { //先计算依赖项的值
                        var basePDCItem = _PDC[bases[i]];
                        if (basePDCItem.status === 0) {
                            continue;
                        } else {
                            yield _doForwardScanAllRecursiveRunInPDC(bases[i]);
                        }
                    }
                    for (let i = 0; i < bases.length; i++) {
                        var baseName = bases[i];
                        baseValues[i] = _PDC[baseName].value;
                        //   _doForwardScanAllRecursiveRunInPDC(baseName);放在哪里合适，上面还是下面。
                    }
                    var parseResult = yield parseCalcRule(pdcObject.ruleDesc, baseValues);
                    if (Math.abs(parseResult - pdcObject.value) < context.$_doubleThreshold) {
                        applyStopNums += 1;
                    }
                    pdcObject.status = 1;
                    pdcObject.value = parseResult;
                }

            };
            //解析规则


        }; //end function _doHoldRuleAccessorAndDoRun


    }; //end function _doGetRulePDCWithThrow

}; //end _getCalcRuleValueFromPDCWithThrow
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
 * 7. 关于webservice的更新通知，webservice并不是直接的客户自己的webservice，而是由webserviceserver负责监察通知的服务。服务必须符合观察通知模型。如果服务发生变化，必须通知oberser。obserser会修改ruleaccessor的lastmodifiedtime。
 */

function* sandBoxEval(express, pdc) { //这里需要安全的实现沙箱，暂时直接执行。
    //表达式检查
    const G = pdc;
    var valid = yield doExpressCheck();
    if (!valid) {
        var err = { no: exceptionMgr.ruleParseException, context: { ruleFormula: express } };
        throw err;
    }

    var result = yield doEval();
    return result;

    function* doEval() {
        return eval(express);
    }

    function* doExpressCheck() {
        return true;
    }
}

function* formatPDCData(rootCalcRuleName, PDC) {

    var value = PDC[rootCalcRuleName];
    if (null === value) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName} data from PDC.` };
        throw (err);
    }
    return yield doFormatPDCRule(rootCalcRuleName);

    function* doFormatPDCRule(ruleName) {
        var pdcObject = PDC[ruleName];
        var node = {
            name: ruleName,
            ruleDes: pdcObject.ruleDesc,
            value: pdcObject.value,
            bases: []
        };
        var bases = pdcObject.forwardBases;
        for (let i = 0; i < bases.length; i++) {
            let childNode = yield doFormatPDCRule(bases[i]);
            node.bases.push(childNode);
        }
        return node;
    };

};

function* newIncubatorEditableWithAllocateContainerWithThrow(incubatorAccessorTag, ownerTag) {
    //为了保护演变关系，资源分配后就不允许改动了。
    var newIncubator = yield dbMgr.newItemEditableInAccessorWithThrow(incubatorAccessorTag);
    //如果没有父incubator，就为孵化器创建container资源。
    var newPDCAccessor = yield dbMgr.newAccessorEditableWithThrow("PDC");
    yield newPDCAccessor.save();
    newIncubator.container.PDCAccessorTag = newPDCAccessor.thisTag; //复制容器环境
    var newRecordAccessor = yield dbMgr.newAccessorEditableWithThrow("RECORD");
    yield newRecordAccessor.save();
    newIncubator.container.recordAccessorTag = newRecordAccessor.thisTag;

    var newRuleAccessor = yield dbMgr.newAccessorEditableWithThrow("RULE");
    yield newRuleAccessor.save();
    var newTerminologyAccessor = yield dbMgr.newAccessorEditableWithThrow("TERMINOLOGY");
    yield newTerminologyAccessor.save();

    newIncubator.strategy.ruleAccessorTag = newRuleAccessor.thisTag;
    newIncubator.strategy.terminologyAccessorTag = newTerminologyAccessor.thisTag;
    yield newIncubator.save();
    return newIncubator;
}

function* newIncubatorEditableWithFatherWithThrow(incubatorAccessorTag, parent, ownerTag) {
    //为了保护演变关系，资源分配后就不允许改动了。
    //如果没有父incubator，就为孵化器创建container资源。
    if (!parent) {
        var err = { no: exceptionMgr.parameterException, context: { father: parent } };
        throw err;

    } else {
        var newIncubator = yield dbMgr.newItemEditableInAccessorWithThrow(incubatorAccessorTag);
        newIncubator.tracer.ownerTag = ownerTag;

        var fatherIncubator = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(incubatorAccessorTag);
        newIncubator.tracer.parent = parent;
        newIncubator.container = fatherIncubator.container; //复制容器环境
        var newRuleAccessor = yield dbMgr.newAccessorEditableWithThrow("RULE", fatherIncubator.strategy.ruleAccessorTag);
        yield newRuleAccessor.save();
        var newTerminologyAccessor = yield dbMgr.newAccessorEditableWithThrow("TERMINOLOGY", fatherIncubator.strategy.terminologyAccessorTag);
        yield newTerminologyAccessor.save();

        newIncubator.strategy.ruleAccessorTag = newRuleAccessor.thisTag;
        newIncubator.strategy.terminologyAccessorTag = newTerminologyAccessor.thisTag;
        yield newIncubator.save();
        return newIncubator;
    }

};

function* _addIncubatorWithThrow(accessorTag, incubatorInfo) {
    if (!incubatorInfo) {
        incubatorInfo = {};
    };
    if (!incubatorInfo.protoRuleAccessorTag) {
        var sysRuleAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.rootRuleAccessorTagCfgCriteria);
        incubatorInfo.ruleAccessorTag = yield dbMgr.addAccessorWithThrow("RuleDescriptor", sysRuleAccessorTag);
    } else {
        incubatorInfo.ruleAccessorTag = yield dbMgr.addAccessorWithThrow("RuleDescriptor", incubatorInfo.protoRuleAccessorTag);
    }
    if (!incubatorInfo.protoTermAccessorTag) {
        var sysTermAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.terminologyAccessorTagCfgCriteria);
        incubatorInfo.termAccessorTag = yield dbMgr.addAccessorWithThrow("Terminology", sysTermAccessorTag);
    } else {
        incubatorInfo.termAccessorTag = yield dbMgr.addAccessorWithThrow("Terminology", incubatorInfo.protoTermAccessorTag);
    }
    //
    if (!incubatorInfo.parent) {
        //新建container
        var pdcAccessorTag = yield dbMgr.addAccessorWithThrow("PDCStatus");
        var recordAccessorTag = yield dbMgr.addAccessorWithThrow("Record");
        _.extend(incubatorInfo, { container: { record: { accessorTag: recordAccessorTag }, PDC: { accessorTag: pdcAccessorTag } } });
    } else {
        var pIncubator = yield dbMgr.theOneItemInAccessorWithThrow(parent.accessorTag, { name: parent.name });
        _extend(incubatorInfo, { container: pIncubator.container });

    }

    var _incubatorInfo = {
        name: (new ObjectID()).toString(),
        strategy: { ruleAccessorTag: incubatorInfo.ruleAccessorTag, terminologyAccessorTag: incubatorInfo.termAccessorTag },
        parent: incubatorInfo.parent,
        container: incubatorInfo.container
    }
    return yield dbMgr.addOneItemToAccessorWithThrow(accessorTag, _incubatorInfo);
}
module.exports.addIncubatorWithThrow = async(_addIncubatorWithThrow);
module.exports.newIncubatorEditableWithAllocateContainerWithThrow = async(newIncubatorEditableWithAllocateContainerWithThrow);
module.exports.newIncubatorEditableWithFatherWithThrow = async(newIncubatorEditableWithFatherWithThrow);

function* _getRuleObjectByTerminologyTagWithThrow(accessorTag, incubatorName, ruleName) {
    var incubator = yield dbMgr.theOneItemInAccessorWithThrow(accessorTag, { name: incubatorName });
    var termAccessorTag = incubator.strategy.terminologyAccessorTag;
    var qName = yield termMgr.terminologyTag2QualifiedName(qName, termAccessorTag);
    return yield _getRuleObjectByQNameWithThrow(accessorTag, incubatorName, qName);
};

function* _getRuleObjectByQNameWithThrow(accessorTag, incubatorName, qName) {
    var incubator = yield dbMgr.theOneItemInAccessorWithThrow(accessorTag, { name: incubatorName });
    var ruleAccessorTag = incubator.strategy.ruleAccessorTag;
    var termAccessorTag = incubator.strategy.terminologyAccessorTag;
    var pdcAccessorTag = incubator.container.PDC.accessorTag;
    var recordAccessorTag = incubator.container.record.accessorTag;
    var ruleName = yield termMgr.qualifiedName2TerminologyTagWithThrow(qName, termAccessorTag);
    var result = yield _doGetRuleObjectByTerminologyTagWithThrow(ruleName);
    return result;

    function* _doGetRuleObjectByTerminologyTagWithThrow(ruleName) {
        var ruleDescriptor = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(ruleAccessorTag, { name: ruleName });
        var result = {};
        result.name = yield cryptMgr.cryptWith(ruleName);
        var QName = yield termMgr.terminologyTag2QualifiedName(ruleName, termAccessorTag);
        result.pretty = QName.split("/").pop();
        result.style = ruleDescriptor.rule.style;
        switch (ruleDescriptor.rule.style) {
            case "D0":
            case "D1":
            case "D3":
                result.iValue = ruleDescriptor.rule.iValue;
                return result;
                break;
            case "D2": //时间
                var time = new Date(ruleDescriptor.rule.iValue);
                result.iValue = time;
                return result;
                break;
            case "D4": //组，分别计算每个bases，作为其ivalue;一般的计算也不需要保存到record中，耗时的迭代运算才需要用到recorder。
                result.iValue = [];
                for (let i = 0; i < ruleDescriptor.rule.bases.length; i++) {
                    var base = ruleDescriptor.rule.bases[i];
                    var baseValue = yield _doGetRuleObjectByTerminologyTagWithThrow(base);
                    result.iValue.push(baseValue);
                }
                return result;
                break;
                //
            case "C1": //依赖作为formula的一部分
                result.iValue = yield _getCalcRuleValueFromPDCWithThrow(ruleName);
                return result;
                break;
            default:
                var err = { no: exceptionMgr.parameterException, context: { style: ruleDescriptor.rule.style } };
                throw err;
        }

    };

    function* _getCalcRuleValueFromPDCWithThrow(ruleName) {
        //computing in this pdc
        //firstly should lock strategy.
        var ruleDescriptor = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(ruleAccessorTag, { name: ruleName });
        var context = {};
        var _G = {};
        try {

            var bases = ruleDescriptor.rule.bases;
            for (let i = 0; i < bases.length; i++) {
                var baseObj = yield _doGetRuleObjectByTerminologyTagWithThrow(bases[i]);

                _G["_" + i] = baseObj.iValue;
            }
            var result = eval(ruleDescriptor.rule.formula);
            return result;

        } catch (e) {
            throw e;
        }

    };

};

function* _modifyRulesValueWithThrow(accessorTag, incubatorName, rulesChanged) {
    var incubator = yield dbMgr.theOneItemInAccessorWithThrow(accessorTag, { name: incubatorName });
    var ruleAccessorTag = incubator.strategy.ruleAccessorTag;
    var termAccessorTag = incubator.strategy.terminologyAccessorTag;
    var pdcAccessorTag = incubator.container.PDC.accessorTag;
    var recordAccessorTag = incubator.container.record.accessorTag;
    var inserted = [];
    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(ruleAccessorTag, async(function*() { //先为了安全加锁，防止查询时，已经被改变了
        for (let i = 0; i < rulesChanged.length; i++) {
            var ruleDesc = rulesChanged[i];
            var inAccessor = yield dbMgr.theOneItemInAccessorWithThrow(ruleAccessorTag, { name: ruleDesc.tag });
            if (!inAccessor) {
                var selfRuleDesc = {};
                selfRuleDesc.name = ruleDesc.tag;
                selfRuleDesc.rule = {};
                selfRuleDesc.rule.style = ruleDesc.style
                selfRuleDesc.rule.iValue = ruleDesc.value;
                inserted.push(selfRuleDesc);
            } else { //已经在自己accessor中了，update
                var updated = {};
                updated.rule = {
                    style: ruleDesc.style,
                    iValue: ruleDesc.value
                };
                yield dbMgr.updateItemsInAccessorWithThrow(ruleAccessorTag, { name: ruleDesc.tag }, updated)
            }
        }
        yield dbMgr.addItemsToAccessorWithThrow(ruleAccessorTag, inserted);

    }), context);
    if (rulesChanged.length > 0) {
        yield dbMgr.updateAccessorWithThrow(ruleAccessorTag, { lastModified: Date.now() })
    }
};
module.exports.modifyRulesValueWithThrow = async(_modifyRulesValueWithThrow);
module.exports.getRuleObjectByQNameWithThrow = async(_getRuleObjectByQNameWithThrow);
module.exports.getRuleObjectByTerminologyTagWithThrow = async(_getRuleObjectByTerminologyTagWithThrow);