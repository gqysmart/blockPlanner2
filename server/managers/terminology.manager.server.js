/**
 * 
 */

const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const sysConfig = require("../config/sys.js");
const Accessor = mongoose.model("Accessor");
const dbMgr = require("./db.manager.server");
const exceptionMgr = require("./exception.manager.server");
//mongoose 
//
const defaultTransfer2TerminologyTagOptions = {
    lan: "cn" //en,cn
}


module.exports.terminologyTag2QualifiedName = async(terminologyTag2QualifiedName);

function* terminologyTag2QualifiedName(terminologyTag, terminologyAccessorTag, options) {
    if (!options) { options = {} };
    _.defaults(options, defaultTransfer2TerminologyTagOptions);
    //


    var rootterm = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(terminologyAccessorTag, { name: terminologyTag }, { "pretty": 1 });
    if (!rootterm) {
        var err = { no: exceptionMgr.qualifiedNameNotExistException, context: { name: terminologyTag, accessorTag: terminologyAccessorTag } };
        throw err;
    }
    switch (options.lan) {
        case "en":
            return rootterm.pretty.en;
            break;
        case "cn":
            return rootterm.pretty.cn;

            break;
    }

};


//refactory

function* qualifiedName2TerminologyTagWithThrow(qName, terminologyAccessorTag, options) {
    if (!_.isString(qName)) {
        var err = { no: exceptionMgr.parameterException, context: { qName: qName, accessorTag: terminologyAccessorTag } };
        throw err;
    }
    if (!options) { options = {} };
    _.defaults(options, defaultTransfer2TerminologyTagOptions);


    var rootterm = null;
    switch (options.lan) {
        case "en":
            rootterm = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(terminologyAccessorTag, { "pretty.en": qName }, { returnFields: ["name"] });
            break;
        case "cn":
            rootterm = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(terminologyAccessorTag, { "pretty.cn": qName }, { returnFields: ["name"] });

            break;
    }

    if (!rootterm) {
        var err = { no: exceptionMgr.qualifiedNameNotExistException, context: { qName: qName, accessorTag: terminologyAccessorTag } };
        throw err;
    }

    return rootterm.name;
};
module.exports.qualifiedName2TerminologyTagWithThrow = async(qualifiedName2TerminologyTagWithThrow);

function* generatorTerminologyNameByqualifiedNameUnunique(qName) {
    var newName = new ObjectID();
    return newName.toString();
}
module.exports.generatorTerminologyNameByqualifiedNameUnunique = async(generatorTerminologyNameByqualifiedNameUnunique);

function* addTerminologiesByRuleDefine(terminologyAccessorTag, ruleDefines) {
    if (!_.isArray(ruleDefines)) {

        ruleDefines = [ruleDefines];
    }
    var terminologies = [];
    for (let i = 0; i < ruleDefines.length; i++) {
        var cnName = ruleDefines[i].name;
        var desObject = yield parseDesc(ruleDefines[i].desc);
        var item = {
            name: yield generatorTerminologyNameByqualifiedNameUnunique(cnName),
            pretty: { cn: cnName }
        };
        _.defaults(item, desObject);
        terminologies.push(item);
    }

    function* parseDesc(desc) {
        if (!desc) {
            desc = "";
        }
        var result = {};

        var descSegs = desc.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            if (/^单位/.test(descSegs[i])) {

                var unitDesc = descSegs[i];
                var unit = unitDesc.split(":")[1];
                result.unit = unit;
                continue;
            }
        }
        return result;

    }

    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(terminologyAccessorTag, async(function*() {
        if (terminologies.length > 0) {
            yield dbMgr.addItemsToAccessorWithThrow(terminologyAccessorTag, terminologies);

        }

    }), context);


};

function* addTerminologiesByBlockDefine(terminologyAccessorTag, ruleDefines) {
    if (!_.isArray(ruleDefines)) {
        ruleDefines = [ruleDefines];
    }
    var terminologies = [];
    for (let i = 0; i < ruleDefines.length; i++) {
        var cnName = ruleDefines[i].name;
        var desObject = yield parseDesc(ruleDefines[i].desc);
        var item = {
            name: yield generatorTerminologyNameByqualifiedNameUnunique(cnName),
            pretty: { cn: cnName }
        };
        _.defaults(item, desObject);
        terminologies.push(item);
    }

    function* parseDesc(desc) {
        if (!desc) {
            desc = "";
        }
        var result = {};

        var descSegs = desc.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            if (/^单位/.test(descSegs[i])) {

                var unitDesc = descSegs[i];
                var unit = unitDesc.split(":")[1];
                result.unit = unit;
                continue;
            }
        }
        return result;

    }

    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(terminologyAccessorTag, async(function*() {
        if (terminologies.length > 0) {
            yield dbMgr.addItemsToAccessorWithThrow(terminologyAccessorTag, terminologies);

        }

    }), context);


};
module.exports.addTerminologiesByRuleDefine = async(addTerminologiesByRuleDefine);
module.exports.addTerminologiesByBlockDefine = async(addTerminologiesByBlockDefine);