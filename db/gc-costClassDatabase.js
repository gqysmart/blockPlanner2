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
const costClasses = "architecture.costClasses" + version;


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
        while (i < costClassList.length) {
            var rule = costClassList[i];
            var parentName = rule.parentName;

            var newRule = {};
            if (parentName != null) {
                newRule.className = yield qualifiedName2TermID(db, rule.parentName)
            }

            newRule.name = yield qualifiedName2TermID(db, rule.name);


            yield db.collection(costClasses).insertOne(newRule);
            i++;

        }



    } catch (e) {
        console.log(e);

    } finally {
        db.close();
    }

});



function* qualifiedName2TermID(db, qName) {
    var nameList = qName.split(".");
    var i = 0;
    var resultTermID = null;
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

var costClassList = [{
        name: nameTotalCostofProject,

    },
    {
        name: nameCostofDevelopment,
        parentName: nameTotalCostofProject,

    }, {
        name: namePeriodCost,
        parentName: nameTotalCostofProject,

    },
    {
        name: nameInvestmentWithoutTax,
        parentName: nameTotalCostofProject,

    },
    {
        name: nameTaxDuringDevelopment,
        parentName: nameTotalCostofProject,

    },
    //开发成本计算

    {
        name: nameLandCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameEarlierStageCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameConstructionAndInstallationCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameInfrastructureCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: namePublicSupportingFacilitiesCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameUnforeseeableCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameIndirectCost,
        parentName: nameCostofDevelopment,

    },
    {
        name: nameCapitalizedInterest,
        parentName: nameCostofDevelopment,

    },
    //土地费用
    {
        name: namePriceOfLand,
        parentName: nameLandCost,

    },



];