/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project')
        .service('projectInfo', projectInfo);
    var projectInfoCache = {};
    var allUserProjectsSummary = {};
    var allUserProjectsSummaryCached = false;
    const urlProjectsSummary = "/home/projects";
    const urlCreateProject = "/home/createProject";
    const urlOpenProject = "/home/openProject";
    var cached = false;

    /** @ngInject */
    function projectInfo($q, $http, $timeout, $window) {
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
        this.allUserProjectsSummary = getAllUserProjectsSummary;
        this.createProject = createProject;
        this.openProject = openProject;

        function getAllUserProjectsSummary() {
            var loadProjectsSummary = $q.defer();

            if (!allUserProjectsSummaryCached) {

                $http({ method: "GET", url: urlProjectsSummary }).then(
                    function(response) {
                        allUserProjectsSummary = response.data;
                        allUserProjectsSummaryCached = true;
                        loadProjectsSummary.resolve(allUserProjectsSummary);
                    },
                    function(response) {
                        loadProjectsSummary.reject();
                    });
            } else {
                $timeout(function() {
                    loadProjectsSummary.resolve(allUserProjectsSummary);
                }, 0);

            }
            return loadProjectsSummary.promise;


        };

        function createProject(projectInfo) {
            var createProject = $q.defer();
            $http({ method: "post", data: projectInfo, url: urlCreateProject }).then(
                function(response) {
                    allUserProjectsSummary.push(response.data);
                    createProject.resolve(allUserProjectsSummary);
                },
                function(response) {
                    createProject.reject();
                });

            return createProject.promise;

        };

        function openProject(projectSummary) {
            $window.location.href = (urlOpenProject + "/" + projectSummary.name);
            var abs = $location.absUrl();
        };
    };
    /** @ngInject */

})();