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
    var qualifiedName = '';
    yield getPrettyName(terminologyTag);

    function* getPrettyName(terminologyTag) {
        var terminologyItem = yield Terminology.findOne({ name: terminologyTag, "tracer.ownerTag": terminologyAccessorTag });
        switch (options.lan) {
            case "en":
                qualifiedName = terminologyItem.desc.en + options.delimiter + qualifiedName;
                break;
            case "cn":
                qualifiedName = terminologyItem.desc.cn + options.delimiter + qualifiedName;
                break;
        }
        if (!terminologyItem.parentName) {
            return;
        }
        yield getPrettyName(terminologyItem.parentName);

    }
    return qualifiedName.slice(0, qualifiedName.length - 1);




}


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
            rootterm = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(terminologyAccessorTag, { "pretty.en": qName });
            break;
        case "cn":
            rootterm = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(terminologyAccessorTag, { "pretty.cn": qName });

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

function* addTerminologyByRuleDefine(terminologyAccessorTag, ruleDefine) {
    var _nameCn = ruleDefine.name;
    var descResult = {};

    yield parseDesc(ruleDefine.desc);

    function* parseDesc(desc) {
        if (!desc) {
            desc = "";
        }

        var descSegs = desc.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            if (/^单位/.test(descSegs[i])) {

                var unitDesc = descSegs[i];
                var unit = unitDesc.split(":")[1];
                descResult.unit = unit;
                continue;
            }
        }

    }

    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(terminologyAccessorTag, async(function*() {
        var existTerm = yield dbMgr.theOneItemCoreReadOnlyInProtoAccessorWithThrow(terminologyAccessorTag, { "detail.cn": _nameCn });
        if (!existTerm) {
            var item = {
                name: yield generatorTerminologyNameByqualifiedNameUnunique(_nameCn),
                pretty: { cn: _nameCn },
                unit: descResult.unit,
                explaination: descResult.explaination,
                markdown: descResult.markdown,
            }
            yield dbMgr.addItemInAccessorWithThrow(terminologyAccessorTag, item);

        }
    }), context);


};
module.exports.addTerminologyByRuleDefine = async(addTerminologyByRuleDefine);