 angular.module('BlurAdmin.pages')
     .service("dataSwapCenter", dataSwapCenter);

 function dataSwapCenter() {
     var dataPool = { "goodcity.plan.constructArea": ["hh"] };

     this.publishData = function(dataName, value) {

         dataPool[dataName] = value;
     };
     this.listenToData = function(dataName, cb) {
         if (dataPool[dataName]) {
             dataPool[dataName].push(cb);
         } else {
             dataPool[dataName] = [cb];
         }
     };

     this.getDataValue = function(dataName, cb) {
         var value = dataPool[dataName];

         return cb(value);


     };

 };