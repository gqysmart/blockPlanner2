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
        var bases = yield parseBases(blockDefine.bases);
        var interface = yield parseInterface(blockDefine.interface);
        var infoblock = yield parseInfoblock(blockDefine.infoBlock);

        var item = {
            name: name,
            bases: bases,
            interface: interface,
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

    function* parseInterface(interface) {

        return interface;
    };

    function* parseInfoblock(infoBlock) {
        return infoBlock;
    };

    function* parseName(aString) {
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

function* _getInfoByInterfaceNameWithThrow(blockName, interfaceName) {
    var accessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainInfoblockAccessorTagCfgCriteria);
    return yield _doGetInfoByInterfaceNameWithThrow(blockName, interfaceName);

    function* _doGetInfoByInterfaceNameWithThrow(blockName, interfaceName) {
        var block = yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(accessorTag, { name: blockName });
        var infoBlock = block.infoBlock;
        var bases = block.bases;
        var interface = block.interface;
        var theInterface = interface[interfaceName];
        var getFunc = theInterface.getter;
        return yield _doParseGetFunc(getFunc);

        function* _doParseGetFunc(funcDesc) {
            // const rFuncName = /([A-Z]+)\(([a-zA-Z0-9\/,]*)\)/;
            const rFuncName = /([A-Z]+)\(([^\.\s]*)\)/;

            var funcSeq = rFuncName.exec(funcDesc);
            var funcName = funcSeq[1];
            switch (funcName) {
                case "SUMINTERFACE":
                    var interfaceName = funcSeq[2];
                    var baseValues = [];
                    for (let i = 0; i < bases.length; i++) {
                        var baseName = bases[i];
                        var result = yield _doGetInfoByInterfaceNameWithThrow(baseName, interfaceName);
                        baseValues.push(result);
                    }
                    return _.sum(baseValues);
                    break;
                case "TIMEPROPGET":
                    var propName = funcSeq[2];
                    return new Date(infoBlock[propName]);
                    break;

                case "PROPGET":
                    var propName = funcSeq[2];
                    return infoBlock[propName];
            }
        }
    }

};
module.exports.getInfoByInterfaceNameWithThrow = async(_getInfoByInterfaceNameWithThrow);