/**
 * 
 * 
 * 
 */
const MongoClient = require("mongoDB").MongoClient;
const assert = require("assert");
const co = require("co");
const GCDBConnString = "mongodb://localhost:27017/goodcity";
const testConnString = "mongodb://localhost:27017/test";
const version = "";
const termCollection = "architecture.terminology" + version;
const costCalRules = "architecture.costCalRules" + version;


const costNamePrefix = "goodcity.cost.";
const nameCostofDevelopment = costNamePrefix + "costofdevelopment"; //开发成本
const nameTotalCostofDevelopmentPerSquareMetre = (costNamePrefix + "CostofDevelopmentPerSquareMetre").toLowerCase(); //每平方米开发成本
const nameCostofDevelopmentPerSquareMetre = (costNamePrefix + "CostofDevelopmentPerSquareMetre").toLowerCase(); //每平方米开发成本


const namePeriodCost = costNamePrefix + "periodcost"; //期间费用
const nameInvestmentWithoutTax = costNamePrefix + "investmentwithouttax"; //不含税费总投
const nameTaxDuringDevelopment = costNamePrefix + "taxduringdevelopment"; //开发期间税费
const nameTotalCostofProject = costNamePrefix + "totalcostofproject"; //项目总成本

//leve2 cost
const nameLandCost = (costNamePrefix + "landcost").toLowerCase(); //土地费
const nameEarlierStageCost = (costNamePrefix + "EarlierStageCost").toLowerCase(); //前期工程费
const nameConstructionAndInstallationCost = (costNamePrefix + "ConstructionAndInstallationCost").toLowerCase(); //建筑安装工程费
const nameInfrastructureCost = (costNamePrefix + "InfrastructureCost").toLowerCase(); //基础设施费
const namePublicSupportingFacilitiesCost = (costNamePrefix + "PublicSupportingFacilitiesCost").toLowerCase(); //公共配套设施费
const nameUnforeseeableCost = (costNamePrefix + "unforeseeablecost").toLowerCase(); //不可预见费
const nameIndirectCost = (costNamePrefix + "IndirectCost").toLowerCase(); //开发间接费
const nameCapitalizedInterest = (costNamePrefix + "CapitalizedInterest").toLowerCase(); //资本化利息

//level3 cost
const namePriceOfLand = (costNamePrefix + "PriceOfLand").toLowerCase(); //土地价格





//设计变量名
const designNamePrefix = "goodcity.design.";
const nameTotalCapacityBulidingArea = (designNamePrefix + "totalcapacitybuildingarea").toLowerCase(); //总计容面积
const nameTotalFloorArea = (designNamePrefix + "totalFloorArea").toLowerCase(); //总建筑面积

//单位变量名
const unitNamePrefix = "goodcity.unit.";
const currencyUnitNamePrefix = (unitNamePrefix + "currency.").toLowerCase(); //货币
const areaUnitNamePrefix = (unitNamePrefix + "area").toLowerCase(); //面积
const yuan = (currencyUnitNamePrefix + "yuan").toLowerCase(); //元
const squreMetre = (areaUnitNamePrefix + "squareMetre").toLowerCase(); //平方米
//财务变量名
const financeNamePrefix = "goodcity.fiance.";

//运维变量名
const operAndMaintanceNamePrefix = "goodcity.operationandmaintance.";
const projectConstructStartTime = (operAndMaintanceNamePrefix + "projectConstructstartTime").toLowerCase(); //营造开始时间

const projectConstructendTime = (operAndMaintanceNamePrefix + "projectConstructEndTime").toLowerCase(); //营造结束时间



co(function*() {
    var db = yield MongoClient.connect(testConnString);
    console.log("connect test successfully.");
    //  yield db.collection(termCollection).creatIndex({ "name.en": 1, _id: 1, parentID: 1 }, { unique: true });
    try {

        for (let i = 0; i < costCalRuleList2.length; i++) {

            let rule = costCalRuleList2[i];
            let ruleNameTag = yield qualifiedName2TermID(db, rule.name);
            let bases = [];
            for (let j = 0; j < rule.computeRule.bases.length; j++) {
                let baseName = yield qualifiedName2TermID(db, rule.computeRule.bases[j]);
                bases.push(baseName);
            }
            let newRule = {
                name: ruleNameTag,
                rule: {
                    bases: bases,
                    desc: rule.computeRule.desc,
                    markdown: {
                        cn: rule.computeRule.markdown.cn,
                        en: rule.computeRule.markdown.en
                    }
                }
            };
            yield db.collection(costCalRules).insertOne(newRule);

        }


    } catch (e) {
        console.log(e);

    } finally {
        db.close();
    }

});

function* parseDependenceList(db, originList) {
    var result = [];
    var i = 0;
    while (i < originList.length) {
        var dependency = originList[i];
        result.push(yield qualifiedName2TermID(db, dependency.name));

        i++
    }
    return result;
}

function* qualifiedName2TermID(db, qName) {
    var nameList = qName.split("/");
    var i = 0;
    var resultTermID = null;
    var name;
    var termObject;
    while (i < nameList.length) {
        name = nameList[i];
        termObject = yield db.collection(termCollection).findOne({ parentName: resultTermID, "desc.cn": name });
        // termObject = yield { _id, 100 };

        resultTermID = termObject.name;
        i++;

    }

    assert.notEqual(resultTermID, 0);
    return resultTermID;
};



var costCalRuleList2 = [{
        name: "江苏嘉城/成本/项目总成本",
        computeRule: {
            bases: ["江苏嘉城/成本/开发成本", "江苏嘉城/成本/期间费用", "江苏嘉城/成本/不含税费总投资", "江苏嘉城/成本/开发期间税费", "江苏嘉城/成本/返还费用"],
            desc: "AS==", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }, {
        name: "江苏嘉城/成本/开发成本",
        computeRule: {
            bases: [],
            desc: "DN=10=0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }, {
        name: "江苏嘉城/成本/期间费用",
        computeRule: {
            bases: [],
            desc: "DN=10=0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }, {
        name: "江苏嘉城/成本/不含税费总投资",
        computeRule: {
            bases: [],
            desc: "DN=10=0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }, {
        name: "江苏嘉城/成本/开发期间税费",
        computeRule: {
            bases: [],
            desc: "DN=10=0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }, {
        name: "江苏嘉城/成本/返还费用",
        computeRule: {
            bases: [],
            desc: "DN=10=0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            markdown: {
                cn: "由子级自动计算",
                en: "auto Sum"
            }
        }
    }



];