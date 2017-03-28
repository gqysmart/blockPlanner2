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
const termCollection = "terminology";
const costRules = "costRules";


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

        var i = 0;
        while (i < costRuleList.length) {
            var rule = costRuleList[i];
            var parentName = rule.parentName;
            var classNameID = 0;
            if (parentName != null) {
                classNameID = yield qualifiedName2TermID(db, rule.parentName)
            }

            var newRule = {
                nameID: yield qualifiedName2TermID(db, rule.name),
                classNameID: classNameID,
                rule: {
                    compute: {
                        value: rule.computeRule.oper,
                        desc: rule.computeRule.desc,
                        deps: yield parseDependenceList(db, rule.computeRule.base)
                    },
                    payment: {
                        plan: rule.paymentRule.oper,
                        desc: rule.paymentRule.desc,
                        deps: yield parseDependenceList(db, rule.paymentRule.base)

                    }
                }


            };

            yield db.collection(costRules).insertOne(newRule);
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

var costRuleList = [{
        name: nameTotalCostofProject,
        parentName: null,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameCostofDevelopment,
        parentName: nameTotalCostofProject,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    }, {
        name: namePeriodCost,
        parentName: nameTotalCostofProject,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameInvestmentWithoutTax,
        parentName: nameTotalCostofProject,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameTaxDuringDevelopment,
        parentName: nameTotalCostofProject,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    //开发成本计算

    {
        name: nameLandCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameEarlierStageCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameConstructionAndInstallationCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameInfrastructureCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: namePublicSupportingFacilitiesCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameUnforeseeableCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameIndirectCost,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    {
        name: nameCapitalizedInterest,
        parentName: nameCostofDevelopment,
        computeRule: {
            base: [],
            oper: "CN=",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },
    //土地费用
    {
        name: namePriceOfLand,
        parentName: nameLandCost,
        computeRule: {
            base: [],
            oper: "@",
            desc: {
                cn: "由子级计算"
            }
        },
        paymentRule: {
            base: [{ name: projectConstructStartTime }, { name: projectConstructendTime }],
            oper: "$1:#0/($2-$1):$2@1", //$?时间变量引用；#？ 计算规则变量引用 #0 上次计算余量  支付开始时间点计算：支付值：支付结束时间@每隔时间
            desc: {
                cn: "开工到完工时间内，每隔一个月支付：总额/时间间隔"
            }

        }
    },



];