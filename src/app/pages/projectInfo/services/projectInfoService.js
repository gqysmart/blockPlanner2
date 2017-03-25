/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .service('projectInfo', projectInfo);
    var projectInfoCache = {};
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
                    projectInfoCache = {
                        name: "xxxx",
                        location: { city: '南京市', province: '江苏省' },
                        number: "G235,G240",
                        status: { task: '测算评估', stage: '拿地前' },

                    };
                    cached = true;
                    if (cb) {
                        return cb(projectInfoCache);
                    }

                }, 5600);


            }


        };

        this.save = function(pi, cb) {
            //send save quest to server.

        };

    }
})();