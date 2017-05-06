/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project')
        .service('projectInfo', projectInfo);
    var projectInfoCache = {};
    var urlRuleValueChanged = "/plan/ruleValueChanged";
    var cached = false;
    var cityList = {
        groupBy: "province",
        descBy: "city",
        list: [
            { city: '南京市', province: '江苏省' },
            { city: '镇江市', province: '江苏省' },
            { city: '苏州市', province: '江苏省' },
            { city: '上海市', province: '直辖市' },
            { city: "重庆市", province: "直辖市" },
            { city: "广州市", province: "广东省" }
        ],
        htmlDesc: "city"
    };

    /** @ngInject */
    function projectInfo($q, $http, $timeout) {
        this.load = function(cb) {
            if (cached) {
                if (cb) {
                    return cb(projectInfoCache);
                }

            } else {
                $timeout(function() {
                    if (cb) {
                        return cb(projectInfoCache);
                    }

                }, 0);


            }


        };

        this.save = function(pi, cb) {
            //send save quest to server.
        };
        this.modifyRuleValue = function(ruleValues) {
            var ruleValueSaved = $q.defer();

            if (ruleValues.length > 0) {
                $http({ method: "post", data: ruleValues, url: urlRuleValueChanged }).then(function(res) {
                    ruleValueSaved.resolve(res);
                }, function(res) {
                    ruleValueSaved.reject(res);
                });

            } else {
                $timeout(function() {
                    ruleValueSaved.resolve();
                });
            }
            return ruleValueSaved.promise;


        }
        this.getCityList = function() {
            var getCityListDefer = $q.defer();
            $timeout(function() {
                getCityListDefer.resolve(cityList);
            }); //以后可以改为ajax；
            return getCityListDefer.promise();
        }

    }
})();