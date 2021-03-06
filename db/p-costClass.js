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
const version = ""
const termCollection = "architecture.terminology" + version;
const costCalRules = "architecture.costCalRules" + version;


const costNamePrefix = "goodcity.cost.";
const nameCostofDevelopment = costNamePrefix + "costofdevelopment"; //开发成本
const nameTotalCostofDevelopmentPerSquareMetre = (costNamePrefix + "CostofDevelopmentPerSquareMetre").toLowerCase(); //每平方米开发成本
const nameCostofDevelopmentPerSquareMetre = (costNamePrefix + "CostofDevelopmentPerSquareMetre").toLowerCase(); //每平方米开发成本

var origin = {
    type: "origin", //copy clone bidirection copy has attribue target
    attributes: {},
    mad: { modify: [], add: [], delete: [] },
}

co(function*() {
    var db = yield MongoClient.connect(testConnString);
    console.log("connect test successfully.");
    //  yield db.collection(termCollection).creatIndex({ "name.en": 1, _id: 1, parentID: 1 }, { unique: true });
    try {

        var i = 0;
        while (i < costCalRuleList.length) {
            var rule = costCalRuleList[i];
            var parentName = rule.parentName;
            var classNameID = 0;
            if (parentName != null) {
                classNameID = yield qualifiedName2TermID(db, rule.parentName)
            }

            var newRule = {
                nameID: yield qualifiedName2TermID(db, rule.name),
                classNameID: classNameID,

                compute: {
                    rule: rule.computeRule.oper,
                    desc: rule.computeRule.desc,
                    deps: yield parseDependenceList(db, rule.computeRule.base)
                }



            };

            yield db.collection(costCalRules).insertOne(newRule);
            i++;

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
    var nameList = qName.split(".");
    var i = 0;
    var resultTermID = 0;
    var name;
    var termObject;
    while (i < nameList.length) {
        name = nameList[i];
        termObject = yield db.collection(termCollection).findOne({ parentID: resultTermID, "name.en": name }, { _id: 1 });
        // termObject = yield { _id, 100 };

        resultTermID = termObject._id;
        i++;

    }

    assert.notEqual(resultTermID, 0);
    return resultTermID;
};

var costCalRuleList = [{
        name: nameTotalCostofProject,
        computeRule: {
            base: [],
            oper: "AS=$0", // AS= autoSum 子集自动求和；$0为自动求和结果.WS=web service ,$0 为网络服务返回的值，$1为依赖项1，$n为依赖项n；=表示需要计算，；# directNum
            desc: {
                cn: "由子级自动计算"
            }
        }

    },
    {
        name: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "AS=$0", //(WS@http://goodcity.net/{{1}}/{{2}}=$0)
            desc: {
                cn: "由子级计算"
            }
        }
    }, {
        name: namePeriodCost,
        computeRule: {
            base: [],
            oper: "AS=$0", //#
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameInvestmentWithoutTax,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }


        }
    },
    {
        name: nameTaxDuringDevelopment,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    //开发成本计算

    {
        name: nameLandCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameEarlierStageCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameConstructionAndInstallationCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameInfrastructureCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: namePublicSupportingFacilitiesCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameUnforeseeableCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameIndirectCost,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    {
        name: nameCapitalizedInterest,
        computeRule: {
            base: [],
            oper: "AS=$0",
            desc: {
                cn: "由子级计算"
            }
        }
    },
    //土地费用
    {
        name: namePriceOfLand,
        computeRule: {
            base: [],
            oper: "#",
            desc: {
                cn: "无缺省值直接数"
            }
        }
    },



];