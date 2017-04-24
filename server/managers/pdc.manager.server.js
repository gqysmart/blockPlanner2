/**
 * 
 * 公共数据中心（public data swap center），存储和发布数据。
 * 数据发布:按app发布，例如由设计模块发布的计容面积，只能由设计模块来修改。其他模块只能读取。因此每个模块需要一个标识tag，每个方案有一个数据交换中心。
 * 暂时不考虑此功能。
 * 
 * pdc 主要复制解析计算规则并缓存计算结果。
 */

//init 从systemdb copy calc规则并修改initConfig，记录

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const ObjectID = require("mongoDB").ObjectID;

const _ = require("lodash");
const dbMgr = require("./db.manager.server");
const sysConfig = require("../config/sys");
const exceptionMgr = require("./exception.manager.server");