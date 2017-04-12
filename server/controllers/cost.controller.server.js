/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const { wrap: async, co: co } = require("co");

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const sysConfig = require("../config/sys");
const costMgr = require("../managers/cost.manager.server");
const terminologyMgr = require("../managers/terminology.manager.server");
const incubatorMgr = require("../managers/incubator.manager.server");
const dbMgr = require("../managers/db.manager.server");
const InitConfig = mongoose.model("InitConfig");

module.exports.loadCostInfo = function(req, res, next) {

    // var planCostClassRecord = {
    //     name: "xxxx",
    //     costClass: [{
    //         name: "总成本",
    //         id: 1,
    //         value: 2000,
    //         calRule: "AS=",
    //         childItems: [{
    //                 name: "建设成本",
    //                 value: 2000,
    //                 calRule: "AS=",
    //                 id: "1.1",
    //                 childItems: [
    //                     { name: "土地成本", value: 100, id: "1.1.1", childItems: [], calRule: "CR={{1}} *{{2}}", required: ["出让土地面积", "单方土地价格"] },
    //                     { name: "前期成本", value: 100, id: "1.1.2", childItems: [], calRule: "CR={{1}} *{{2}}", required: ["总建筑面积", "单方前期价格"] },
    //                     { name: "建安成本", value: 100, id: "1.1.3", childItems: [], calRule: "DN=", required: [] },
    //                     { name: "基础设施费用", value: 100, id: "1.1.4", childItems: [], calRule: "DN=", required: [] },
    //                     { name: "公共设施费用", value: 100, id: "1.1.5", childItems: [], calRule: "DN=", required: [] },
    //                     { name: "未预见费用", value: 100, id: "1.1.6", childItems: [], calRule: "DN=", required: [] },
    //                     { name: "间接费", value: 100, id: "1.1.7", childItems: [], calRule: "DN=", required: [] },
    //                     { name: "财务利息", value: 100, id: "1.1.8", childItems: [], calRule: "DN=", required: [] },
    //                 ]
    //             },
    //             { name: "期间成本", value: 100, id: "1.2", childItems: [], calRule: "DN=", required: [] },
    //             { name: "期间投资不计税", value: 100, id: "1.3", childItems: [], calRule: "DN=", required: [] },
    //             { name: "开发期间税", value: 100, id: "1.4", childItems: [], calRule: "DN=", required: [] }

    //         ]
    //     }]

    // };
    co(function*() {

        var rootRuleName = "江苏嘉城/成本/项目总成本";
        var terminologyAccessorTagCfg = yield InitConfig.findOne(dbMgr.terminologyAccessorTagCfgCriteria);
        var tranferOptions = {
            lan: "cn",
            delimiter: "/"
        };
        var nameTag = yield terminologyMgr.qualifiedName2TerminologyTag(rootRuleName, terminologyAccessorTagCfg.value, tranferOptions);

        var incubator = yield incubatorMgr.createIncubator();
        var record = yield incubatorMgr.getRecordFromIncubatorByRuleTerminologyTag(incubator.tracer.ownerTag, incubator.name, nameTag);

        res.json(record);


    })


}