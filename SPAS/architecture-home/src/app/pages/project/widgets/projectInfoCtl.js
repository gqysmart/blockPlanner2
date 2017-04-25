/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages')
        .controller('projectInfoCtl', projectInfoCtl);

    /** @ngInject */
    function projectInfoCtl($scope, projectInfo) {

        var vm = this;
        vm.projectInfo = {};

        vm.saveInfo = function() {
            projectInfo.save(vm.projectInfo);
        };

        projectInfo.load(function(content) {
            vm.projectInfo.name = content.name;
            vm.projectInfo.location = content.location;
            vm.projectInfo.number = "G235,G240";
            vm.projectInfo.status = { task: '测算评估', stage: '拿地前' };




        });
    }
})();