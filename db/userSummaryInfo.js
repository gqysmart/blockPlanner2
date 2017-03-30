/**
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;


/**
 * user schema
 */

const UserSummaryInfoSchema = new Schema({



});

const UserSummaryInfo = {
    user: "refID",
    summary: [ //添加、删除功能模块功能spa
        {
            type: "项目管理enum",
            target: "refuserprojectSummaryInfo",
            show: true
        },
        { type: "profile enum", target: "ref", show: "false" },
        { type: "近期任务\日程安排", target: "ref", show: "true" },
        { type: "消息", target: "ref", "false" },
        {
            type: "其他超链接",
            target: "ref",
            show: true
        }
    ]
};

var UserProjectSummaryInfo = {
    actived: [{ project: "refprojectID", tags: ["star", "bim"] }], //=>project-des,project-pic,project-tags,project-name,project-processbar
    archieved: [], //已归档项  no show
};

var projectdashboard = {
    name: "项目名称", //id ;desc
    version: "xxx", //为防止以后升级后台数据库，导致已有项目不能使用所有数据库，系统级数据库几何通过版本号进行区分；
    summary: [{
            type: "方案比较",
            target: [{ //方案copy ，clone 关联参数，演化图标
                name: "refplan",
                tags: ["最大投资", "最大收益", "自动计算"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "地块土壤约定",
            target: [{ //方案copy ，clone 关联参数，演化图标
                name: "refplan",
                tags: ["代征绿地"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "项目资料管理",
            target: [{
                name: "refplan",
                tags: ["规范"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "进度计划、甘特",
            target: [{
                name: "refplan",
                tags: ["规范"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "人员组织管理",
            target: [{
                name: "refplan",
                tags: ["规范"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "图纸管理与显示",
            target: [{
                name: "refplan",
                tags: ["规范"] //添加、删除标签功能
            }],
            show: true
        },
        {
            type: "BIM模块",
            target: [{
                name: "refplan",
                tags: ["规范"] //添加、删除标签功能
            }],
            show: true
        },
    ]

};

var plan = {
    id: "xxx",
    desc: "",
    orign: [{
            type: "设计数据",
            target: "ref"
        }, {
            type: "营销...财务...运维...等等"
        }, { type: "成本级别", target: "ref" }, {
            type: "自定义术语",
            target: "ref"
        },
        {
            type: "支付方式"
        }
    ],
    relation: [], //克隆，关联，拷贝关系怎么查找？，因为对象是细化分别对待的。有个关系链。
    result: [
        { type: "cost", target: "ref" },
        {
            type: "xx",
            target: "ref"
        }
    ]
}


var costplanSchema = {
    //project 1--->n plan
    //name in project
    //方案可以与其他项目共享，因此没有特定标记
    cost: {
        class: { type: "clone/copy", target: {}, cad: { create: [], add: [], delete: [] } },
        caculateRule: { type: "clone/copy", target: {}, cad: { create: [], add: [], delete: [] } }
    }
};