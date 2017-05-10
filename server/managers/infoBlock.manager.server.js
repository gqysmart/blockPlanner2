/**
 * 
 * 
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
//

const dbMgr = require("./db.manager.server");
const termMgr = require("./terminology.manager.server");
const exceptionMgr = require("./exception.manager.server");
const mainInfoblockAccessorTagCfgCriteria = dbMgr.mainInfoblockAccessorTagCfgCriteria



//refactory

function* _addInfoBlockByBlockDefine(accessorTag, blockDefines) {
    if (!_.isArray(blockDefines)) {
        blockDefines = [blockDefines];
    }
    var blockDescriptors = [];
    for (let i = 0; i < blockDefines.length; i++) {
        var blockDefine = blockDefines[i];
        var name = yield parseName(blockDefine.name);
        var nameprefix = yield parseNamePrefix(blockDefine.namePrefix);
        var thisTag = yield getTag(name);
        var bases = yield parseBases(blockDefine.bases);
        var deps = yield parseDeps(blockDefine.deps);
        var hooks = yield parseHooks(blockDefine.hooks);
        var infoblock = yield parseInfoblock(blockDefine.infoBlock);

        var item = {
            name: name,
            thisTag: thisTag,
            namePrefix: nameprefix,
            bases: bases,
            deps: deps,
            hooks: hooks,
            infoBlock: infoblock,
        };
        blockDescriptors.push(item);
    }

    function* parseBases(bases) {
        if (!bases) {
            return undefined;
        }
        var result = [];

        var descSegs = bases.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            var baseDesc = descSegs[i].split(":");
            result[baseDesc[0] - 1] = baseDesc[1];
        }
        return result;

    }

    function* parseDeps(deps) {
        if (!deps) {
            return undefined;
        }
        var result = [];

        var descSegs = deps.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            var baseDesc = descSegs[i].split(":");
            result[baseDesc[0] - 1] = baseDesc[1];
        }
        return result;

    }

    function* parseHooks(hooks) {

        return hooks;
    };

    function* parseInfoblock(infoBlock) {
        return infoBlock;
    };

    function* parseName(aString) {
        return aString;
    };

    function* parseNamePrefix(aString) {
        return aString;
    };

    function* getTag(aString) {
        // var obj = new ObjectID();
        // return obj.toString();
        return aString;
    }
    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(accessorTag, async(function*() {

        if (blockDescriptors.length > 0) {
            yield dbMgr.addItemsToAccessorWithThrow(accessorTag, blockDescriptors);
        }

    }), context);
};


module.exports.addInfoBlockByBlockDefine = async(_addInfoBlockByBlockDefine);

function* _getInfoByPropNameWithThrow(blockName, propName) {
    var accessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainInfoblockAccessorTagCfgCriteria);
    return yield _doGetInfoByPropNameWithThrow(blockName, propName);

    function* _doGetInfoByPropNameWithThrow(blockName, propName) {
        var block = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(accessorTag, { name: blockName });
        var infoBlock = block.infoBlock;
        var bases = block.bases;
        var hooks = block.hooks;
        var namePrefix = block.namePrefix;
        var _propName = propName.slice(namePrefix.length);
        var hook = hooks[_propName];
        if (hook) {
            var getFunc = hooks[_propName].getter;
            return yield _doParseGetFunc(getFunc, block);
        } else {
            if (infoBlock) {
                return infoBlock[_propName];
            }
            return undefined;
        }

    }

};

function* _getInfoBlockWithThrow(blockName) {
    var accessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainInfoblockAccessorTagCfgCriteria);

    var block = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(accessorTag, { name: blockName });
    var infoBlock = block.infoBlock;
    var bases = block.bases;
    var deps = block.deps;
    var hooks = block.hooks;

    for (let key in hooks) {
        var keyObj = hooks[key];
        if (keyObj.getter) {
            infoBlock[keyObj] = yield _doParseGetFunc(keyObj.getter);
        }
    }
    return infoBlock;
}

function* _doParseGetFunc(funcDesc, block) {
    const infoBlock = block.infoBlock;
    const bases = block.bases;
    const deps = block.deps;
    const hooks = block.hooks;

    // const rFuncName = /([A-Z]+)\(([a-zA-Z0-9\/,]*)\)/;
    const rFuncExpress = /([A-Z]+)\((.*)\)/; //1.函数名 ，2.参数
    const rPropName = /(THIS|DEP|BASE)<([^\.\s]*)>(?:\[([a-zA-z0-9]+)\])?/;
    //  const rFuncName = /([A-Z]+)\(([THIS|DEP|BASE])<([^\.\s]*)>\[([a-zA-z0-9]+)\],([A-Z\|])\)/;

    var funcSeq = rFuncExpress.exec(funcDesc);
    var funcName = funcSeq[1];
    var funcParameters = funcSeq[2] ? funcSeq[2].split(",") : null;
    switch (funcName) {
        case "SIGMA": //对base求和  return<number> func(<base 接口>)；
            var propName = rPropName.exec(funcParameters[0])[2];
            var baseValues = [];
            for (let i = 0; i < bases.length; i++) {
                var baseName = bases[i];
                var result = yield _getInfoByPropNameWithThrow(baseName, propName);
                if (!result) result = 0;
                baseValues.push(result);
            }
            return _.sum(baseValues);

        case "PROPGET":
            if (funcParameters[1]) {
                var filters = funcParameters[1].split("|");
                for (let i = 0; i < filters.length; i++) {
                    switch (filters[i]) {
                        case "NOSHOW":
                            return undefined;
                        default:
                            continue;
                    }
                }
            }

            var propNameSeq = rPropName.exec(funcParameters[0]);
            var propName = propNameSeq[2];
            var result = infoBlock[propName];
            var key = propNameSeq[3];
            if (key) {
                result = result[key];
            }
            return result;

    }


}
module.exports.getInfoBlockWithThrow = async(_getInfoBlockWithThrow);
module.exports.getInfoByPropNameWithThrow = async(_getInfoByPropNameWithThrow);