/**
 * 
 * 
 * 
 */
const MongoClient = require("mongoDB").MongoClient;
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const co = require("co");
const GCDBConnString = "mongodb://localhost:27017/goodcity";
const testConnString = "mongodb://localhost:27017/test";
const version = "";
const termCollection = "architecture.terminology" + version;
const rootTermID = 0;
const gcTermID = 1;
var termID = gcTermID;


// var termGC = {
//     //   _id: gcTermID,

//     name: { en: "goodcity", cn: "江苏嘉城" },
//     desc: "WS@http://goodcity.net/companyInfo"
// }

function getNameNo(name) {
    var nameID = new ObjectID();
    return nameID.toString();
}

var termGC = {
    name: getNameNo("goodcity"),
    desc: { en: "goodcity", cn: "江苏嘉城" },
    link: "http://goodcity.net/companyInfo",
    alias: []
};


co(function*() {
    var db = yield MongoClient.connect(testConnString);
    try {
        console.log("connect test successfully.");
        //  yield db.collection(termCollection).creatIndex({ "name.en": 1, _id: 1, parentID: 1 }, { unique: true });
        yield db.collection(termCollection).insertOne(termGC);
        console.log("insert GCTerm");

        var i = 0;
        while (i < termList.length) {
            var mainRel = termList[i];
            var parentName = mainRel.parent;
            var parentID = yield qulifiedName2TermID(db, parentName);

            var childTermList = mainRel.list;
            var j = 0;
            while (j < childTermList.length) {
                var childTermObject = {
                    name: getNameNo(parentName + "." + childTermList[j].name.en),
                    parentName: parentID,
                    desc: childTermList[j].name,
                    link: childTermList[j].link,
                    alias: childTermList[j].alias
                }

                yield db.collection(termCollection).insertOne(childTermObject);
                j++;
            }
            i++;
        }
    } catch (e) {} finally {
        db.close();

    }

});

function* qulifiedName2TermID(db, qName) {
    var nameList = qName.split(".");
    var i = 0;
    var resultTermID = null;
    var name;
    var termObject;
    while (i < nameList.length) {
        name = nameList[i];
        termObject = yield db.collection(termCollection).findOne({ parentName: resultTermID, "desc.en": name });
        // termObject = yield { _id, 100 };

        resultTermID = termObject.name;
        i++;

    }

    assert.notEqual(resultTermID, 0);
    return resultTermID;
};

function createTermID() {
    return ++termID;

}





//terminology level 1

var termList = [{
        parent: "goodcity",
        list: [{
                name: { en: "unit", cn: "单位" },
                desc: ""
            }, {
                name: { en: "design", cn: "设计" },
                desc: ""
            },
            {
                name: { en: "marking", cn: "营销" },
                desc: ""
            },
            {
                name: { en: "finance", cn: "财务" },
                desc: ""
            },
            {
                name: { en: "construction", cn: "营造" },
                desc: ""
            },
            {
                name: { en: "operationandmaintance", cn: "运维" },
                desc: ""
            },
            {
                name: { en: "cost", cn: "成本" },
                desc: ""
            },
            {
                name: { en: "material", cn: "材料" },
                desc: ""
            }

        ]
    },
    {
        parent: "goodcity.cost",
        list: [{
                name: { en: "costofdevelopment", cn: "开发成本" },
                desc: ""
            }, {
                name: { en: "periodcost", cn: "期间费用" },
                desc: ""
            }, {
                name: { en: "periodcost", cn: "返还费用" },
                desc: ""
            }, {
                name: { en: "investmentwithouttax", cn: "不含税费总投资" },
                desc: ""
            }, {
                name: { en: "taxduringdevelopment", cn: "开发期间税费" },
                desc: ""
            }, {
                name: { en: "totalcostofproject", cn: "项目总成本" },
                desc: ""
            },
            {
                name: { en: "landcost", cn: "土地费" },
                desc: ""
            },
            {
                name: { en: "earlierstagecost", cn: "前期工程费" },
                desc: ""
            },
            {
                name: { en: "constructionandinstallationcost", cn: "建筑安装工程费" },
                desc: ""
            },
            {
                name: { en: "infrastructurecost", cn: "基础设施费" },
                desc: ""
            },
            {
                name: { en: "publicsupportingfacilitiescost", cn: "公共配套设施费" },
                desc: ""
            },
            {
                name: { en: "unforeseeablecost", cn: "不可预见费" },
                desc: ""
            },
            {
                name: { en: "indirectcost", cn: "开发间接费" },
                desc: ""
            },
            {
                name: { en: "capitalizedinterest", cn: "资本化利息" },
                desc: ""
            },
            //PriceOfLand
            {
                name: { en: "priceofland", cn: "土地价格" },
                desc: ""
            }

        ]
    },
    {
        parent: "goodcity.operationandmaintance",
        list: [{
                name: { en: "projectconstructstarttime", cn: "项目开工时间" },
                desc: ""

            },
            {
                name: { en: "projectconstructendtime", cn: "项目竣工时间" },
                desc: ""
            }
        ]
    }


];