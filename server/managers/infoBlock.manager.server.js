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
        var index = yield parseDefaults(blockDefine.default);
        //  var nameprefix = yield parseNamePrefix(blockDefine.namePrefix);
        //   var thisTag = yield getTag(name);
        var bases = yield parseBases(blockDefine.bases);
        var deps = yield parseDeps(blockDefine.deps);
        var hooks = yield parseHooks(blockDefine.hooks);
        var infoblock = yield parseInfoblock(blockDefine.infoBlock);
        _.defaults(infoblock, bases);


        var item = {
            name: name,
            default: index,
            //  thisTag: thisTag,
            //     namePrefix: nameprefix,

            hooks: hooks,
            infoBlock: infoblock,
        };
        blockDescriptors.push(item);
    }

    function* parseBases(bases) {
        if (!bases) {
            return undefined;
        }
        const rBase = /<(.*)>(.*)/
        var baseSeqs = rBase.exec(bases);
        var propName = baseSeqs[1];
        if (propName) {
            var listDesc = baseSeqs[2];
            var result = [];

            var descSegs = listDesc.split("|");
            for (let i = 0; i < descSegs.length; i++) {
                var baseDesc = descSegs[i].split(":");
                result[baseDesc[0] - 1] = yield parseName(baseDesc[1]);
            }

            var returnObj = {};
            returnObj[propName] = result;
            return returnObj;
        }
        return undefined;

    }

    function* parseDefaults(aString) {
        return aString;
    }

    function* parseDeps(deps) {
        if (!deps) {
            return undefined;
        }
        var result = [];

        var descSegs = deps.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            var baseDesc = descSegs[i].split(":");
            result[baseDesc[0] - 1] = yield parseName(baseDesc[1]);
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
        var termAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.terminologyAccessorTagCfgCriteria);
        var name = yield termMgr.qualifiedName2TerminologyTagWithThrow(aString, termAccessorTag);
        return name;
    };

    function* parseNamePrefix(aString) {
        return aString;
    };

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
        //    var namePrefix = block.namePrefix;
        //   var _propName = propName.slice(namePrefix.length);
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

function* _getInfoBlockWithThrow(blockName, infoAccessorTag, termAccessorTag) {
    var accessorTag = infoAccessorTag;
    var block = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(accessorTag, { name: blockName });

    return block;
}

function* _doParseFunc(funcDesc, block, infoAccessorTag, termAccessorTag, context) {
    var _block = block;
    if (!block.infoBlock) { //保证_block 为object，只需要读取一次数据库
        _block = yield _getInfoBlockWithThrow(_block.name, infoAccessorTag, termAccessorTag);
    }
    const infoBlock = _block.infoBlock;
    const hooks = _block.hooks;

    // const rFuncName = /([A-Z]+)\(([a-zA-Z0-9\/,]*)\)/;
    const rFuncExpress = /([A-Z]+)\((.*)\)/; //1.函数名 ，2.参数
    var funcSeq = rFuncExpress.exec(funcDesc);
    var funcName = funcSeq[1];
    var parameters = funcSeq[2];
    switch (funcName) {
        case "SIGMA": //参数:<可求和值数组>函数,单一参数;返回值：总和
            var arr = yield _doParseGetFunc(parameters, _block, infoAccessorTag, termAccessorTag, context);
            if (!arr || !_.isArray(arr)) {
                return undefined;
            }
            return _.sum(arr);
        case "PROPGET": //参数:<属性名>函数，单一参数；返回值：属性存储值
            var propName = yield _doParseFunc(parameters, _block, infoAccessorTag, termAccessorTag, context);
            if (typeof(propName) !== "string") {
                return undefined;
            }
            return infoBlock[propName];
        case "PROPSGET": //参数:<属性名数组>函数，单一参数；返回值：属性存储值列表

            var propNames = yield _doParseFunc(parameters, _block, infoAccessorTag, termAccessorTag, context);
            if (!_.isArray(propNames)) {
                return undefined;
            }
            var result = [];
            for (let i = 0; i < propNames.length; i++) {
                result.push(infoBlock[propNames[i]]);
            }
            return result;
        case "P": //参数:字符串，单一参数；返回值：字符串
            var propName = parameters;
            return propName;
        case "PARAMSARR": //返回字符串数组
            var arr = parameters;
            var result = [];
            const rArr = /^\[.*\]$/;
            if (rArr.test(arr)) {
                try {
                    var obj = _sandboxEval(arr);
                    if (obj && _.isArray(obj)) result = obj;
                } catch (e) { //do nothing
                }
            };
            return result;
        case 'MAP': //参数:<参数数组>函数：返回值：新的数组
            var result = [];
            var paramsArr = yield _doParseFunc(parameters, _block, infoAccessorTag, termAccessorTag, context);
            var param1 = paramsArr[0];
            var sourceArr = yield _doParseFunc(param1, _block, infoAccessorTag, termAccessorTag, context);
            if (!_.isArray(sourceArr) || sourceArr.length === 0) {
                return result;
            }
            var param2 = paramsArr[1];
            var transformFuncName = yield _doParseFunc(param2, _block, infoAccessorTag, termAccessorTag, context);
            var param3 = paramsArr[2]; //用于构成函数参数，由函数自身取解析
            var funcDesc = ("" + transformFuncName).toUpperCase() + "(" + param3 + ")";
            for (let i = 0; i < sourceArr.length; i++) {
                var item = sourceArr[i];
                funcDesc.replace("$index", i).replace("$value", item);
                var value = yield _doParseFunc(funcDesc, _block, infoAccessorTag, termAccessorTag, context);
                result.push(value);
            }
            return result;
        case "INFOGET": //跨block访问信息；
            var paramsArr = yield _doParseFunc(parameters, _block, infoAccessorTag, termAccessorTag, context);
            var param1 = paramsArr[0]; //block  name；
            var blockName = yield _doParseFunc(param1, _block, infoAccessorTag, termAccessorTag, context);
            var param2 = paramsArr[1]; //
            var propName = yield _doParseFunc(param2, _block, infoAccessorTag, termAccessorTag, context);
            var req = {};
            req.method = "GET";
            req.url = "GC://" + blockName + "/" + propName;
            var gcObj = yield _parseRequestWithThrow(req, infoAccessorTag, termAccessorTag, context);
            if (gcObj) {
                return gcObj.value;
            }
            return undefined;
        default: //do nothing
            return undefined;
    }

};

function _sandboxEval(st) {
    return eval(st);
}

function* _doParseSetFunc(funcDesc, blockInfo) {
    const infoBlock = block.infoBlock;
    const bases = block.bases;
    const deps = block.deps;
    const hooks = block.hooks;

    // const rFuncName = /([A-Z]+)\(([a-zA-Z0-9\/,]*)\)/;
    const rFuncExpress = /([A-Z]+)\((.*)\)/; //1.函数名 ，2.参数

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
        case "EACH":

            return bases;
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

            var result = infoBlock[propName];
            return result;
    }


}

function* _getInfoBlockHooksWithThrow(infoAccessorTag, blockName) {
    var accessorTag = infoAccessorTag;
    var block = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(accessorTag, { name: blockName }, { returnFields: ["default", "hooks", "name"] });
    return block;
}

function* _parseRequestWithThrow(req, infoAccessorTag, termAccessorTag, context) {
    if (!context) {
        context = {}; //用于防止循环调用。调用链过长等问题。
    }

    const rRequest = /^(GC|HTTP):\/\/([^\/]*)(?:\/(.*))?/;
    var descSeqs = rRequest.exec(req.url);
    var protocol = descSeqs[1];
    var hostName = descSeqs[2];
    var propName = descSeqs[3];
    if (protocol === "GC") {
        var blockName = yield termMgr.qualifiedName2TerminologyTagWithThrow(hostName, termAccessorTag);
        var oper = req.method;
        switch (oper) {
            case "GET":
                var block = yield _getInfoBlockHooksWithThrow(infoAccessorTag, blockName);
                if (!propName) {
                    propName = block.default;
                    if (!propName) return undefined;
                }
                var hooks = block.hooks;
                if (hooks[propName] && hooks[propName].GET) {
                    var value = yield _doParseFunc(hooks[propName].GET, block, infoAccessorTag, termAccessorTag);
                    var result = { VALUE: value, ATTRS: hooks[propName] ? hooks[propName].ATTRS : undefined };
                    return result;
                } else {
                    //  var block = yield _getInfoBlockWithThrow(blockName);
                    var funcDesc = "PROPGET(P(" + propName + "))";
                    var value = yield _doParseFunc(funcDesc, block, infoAccessorTag, termAccessorTag);
                    var result = { value: value, attrs: hooks[propName] ? hooks[propName].ATTRS : undefined };
                    return result;

                }
                break;
            case "UPDATE":
            case "POST":
                var infos = req.infos;
                if (!infos || typeof(infos) !== "object") return true; //do nothing
                var block = yield _getInfoBlockHooksWithThrow(infoAccessorTag, blockName);
                var hooks = block.hooks;
                var update = {};
                for (let propName in infos) {
                    if (hooks[propName] && (hooks[propName].POST || hooks[propName].UPDATE)) {
                        //do post hook;
                    } else {
                        const dotNatation = "infoBlock.";
                        update[dotNatation + propName] = infos[propName];
                    }
                }
                return yield dbMgr.updateItemsInAccessorWithThrow(infoAccessorTag, { name: block.name }, { $set: update });
                break;
            case "ADD":
            case "REMOVE":
            default:
                break;

        }
    }
};

module.exports.parseRequestWithThrow = async(_parseRequestWithThrow);
module.exports.getInfoBlockWithThrow = async(_getInfoBlockWithThrow);
module.exports.getInfoByPropNameWithThrow = async(_getInfoByPropNameWithThrow);