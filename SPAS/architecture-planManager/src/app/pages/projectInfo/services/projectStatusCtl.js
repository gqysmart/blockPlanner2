/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .controller('ProjectStatusCtl', ProjectStatusCtl);

    /** @ngInject */
    function ProjectStatusCtl() {

        var vm = this;
        vm.disabled = undefined;

        vm.projectStatusList = [
            { task: '测算评估', stage: '拿地前' },
            { task: '施工图设计', stage: '设计' },
            { task: '招商', stage: '运维' },
            { task: '营造', stage: '施工' },
            { task: '规划设计', stage: '设计' },

        ];

        vm.cityShowGroupfn = function() {
            var groups = [];
            for (var i = 0; i < vm.groupedBySelectItems.length; i++) {
                var selectItem = vm.groupedBySelectItems[i];
                var haveGroupped = false;
                for (var j = 0; j < groups.length; j++) {
                    var groupItem = groups[j];
                    if (selectItem.province == groupItem) {
                        haveGroupped = true;
                        break;
                    }

                }
                if (!haveGroupped) {
                    groups.push(seletItem.province)
                }
            }

            return groups;

        };








    }
})();