/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const InitConfig = mongoose.model("InitConfig");

const CalcRuleManager = require("./calcRule.manager.server");
const PDCManager = require("./pdc.manager.server");
const CacheManager = require("./cache.manager.server");

function* constructHierarchy(rootCalcRuleName, pdcAccessorTag, calcRuleAccessorTag, terminologyAccessorTag) {
    var calcRuleDescriptor = yield CalcRuleManager.getCalcRuleDescriptor(calcRuleAccessorTag, rootCalcRuleName);
    if (!calcRuleDescriptor) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName}'s calcRule descriptor.` };
        throw (err);
    }
    var value = yield PDCManager.getCalcRuleValueFromPDC(pdcAccessorTag, calcRuleAccessorTag, rootCalcRuleName);
    if (null === value) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName} data from PDC.` };
        throw (err);
    }

    var node = {
        name: {
            tag: rootCalcRuleName,
            qualified: "xx.xx",
        },
        calcRuleDes: calcRuleDescriptor.rule.desc,
        value: value,
        children: []
    };
    var bases = calcRuleDescriptor.rule.bases;
    for (let i = 0; i < bases.length; i++) {
        let childObject = yield constructHierarchy(bases[i], pdcAccessorTag, calcRuleAccessorTag, terminologyAccessorTag);
        node.children.push(childObject);
    }
    return node;
};


const defaultCostHierarchyCacheOptons = {
    category: "costClass",
    duration: 2 * 365, //unit is day，默认为2天
    style: "cover" //[cover,keep:n]
}

function* cacheCostHierarchy(costHierarchy, options, cacheAccessorTag) {
    if (!options) { options = {} };
    _.defaults(options, defaultCostHierarchyCacheOptons);

    var cacheAccessor = yield CacheManager.cache(costHierarchy, options, cacheAccessorTag);
    if (!cacheAccessor) {
        var err = { no: -1, desc: `cached errored.` }
        throw (err);
    }
    return cacheAccessor;


}

module.exports.cacheCostHierarchy = async(cacheCostHierarchy);