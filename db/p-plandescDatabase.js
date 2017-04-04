/**
 * 
 * 
 */

const MongoClient = require("mongoDB").MongoClient;
const assert = require("assert");
const co = require("co");
const ConnString = "mongodb://localhost:27017/architecture";


co(function*() {
    var db = yield MongoClient.connect(testConnString);
    console.log("connect test successfully.");
    //  yield db.collection(termCollection).creatIndex({ "name.en": 1, _id: 1, parentID: 1 }, { unique: true });
    try {

        var i = 0;
        while (i < costClassList.length) {
            var rule = costClassList[i];
            var parentName = rule.parentName;
            var classNameID = 0;
            if (parentName != null) {
                classNameID = yield qualifiedName2TermID(db, rule.parentName)
            }

            var newRule = {
                nameID: yield qualifiedName2TermID(db, rule.name),
                classNameID: classNameID

            };

            yield db.collection(costClasses).insertOne(newRule);
            i++;

        }



    } catch (e) {
        console.log(e);

    } finally {
        db.close();
    }

});




var userInfoSchema = {
    _id: "ObjectID",
    email: "gqysmart@gmail.com",
    password: {
        salt: "xxx",
        md5: "xxxxx"
    },






}