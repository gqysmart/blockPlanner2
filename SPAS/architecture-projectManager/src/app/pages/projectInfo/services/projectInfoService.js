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

    }
})();