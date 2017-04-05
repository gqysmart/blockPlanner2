/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const fs = require("fs");
const costManager = require("../managers/cost.manager.server");

module.exports.loadCostInfo = function(req, res, next) {

    // var planCostClassCache = {
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
    costManager.loadCostClass(0, function(classData) {

        res.json(classData);
    })






}