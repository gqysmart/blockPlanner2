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
//mongoose 
const Terminology = mongoose.model("Terminology");
//
const defaultTransfer2TerminologyTagOptions = {
    delimiter: ".",
    lan: "cn" //en,cn
}

function* qualifiedName2TerminologyTag(qName, terminologyAccessorTag, options) {
    if (!_.isString(qName)) return null;
    if (!options) { options = {} };
    _.defaults(options, defaultTransfer2TerminologyTagOptions);
    qName = qName.toLowerCase();
    var terminologyAccessor = yield Accessor.findOne({ thisTag: terminologyAccessorTag, version: sysConfig.version });
    if (!terminologyAccessor) {
        var err = { no: -1, desc: `terminology=${terminologyAccessorTag} doesn't exist.` }
        throw (err);
    }
    //
    var namelist = qName.split(options.delimiter);
    var rootName = namelist[0];
    var rootterm = null;
    switch (options.lan) {
        case "en":
            rootterm = yield Terminology.findOne({
                "tracer.ownerTag": terminologyAccessor.thisTag,
                "desc.en": rootName,
                parentName: null
            });
            break;
        case "cn":
            rootterm = yield Terminology.findOne({
                "tracer.ownerTag": terminologyAccessor.thisTag,
                "desc.cn": rootName,
                parentName: null
            });
            break;
    }

    if (!rootterm) {
        return null;
    }
    var parentTag = rootterm.name;
    var lastTag = null;
    for (let i = 1; i < namelist.length; i++) {
        let name = namelist[i];
        let nameDesc = null;
        switch (options.lan) {
            case "en":
                nameDesc = yield Terminology.findOne({ "tracer.ownerTag": terminologyAccessor.thisTag, parentName: parentTag, "desc.en": name });
                break;
            case "cn":
                nameDesc = yield Terminology.findOne({ "tracer.ownerTag": terminologyAccessor.thisTag, parentName: parentTag, "desc.cn": name });
                break;
        }
        if (!nameDesc) { return null }
        parentTag = nameDesc.name;
        lastTag = nameDesc.name;
    }
    return lastTag;
};

module.exports.qualifiedName2TerminologyTag = async(qualifiedName2TerminologyTag);

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

function* createTerminology(accessorTag, name) {


}