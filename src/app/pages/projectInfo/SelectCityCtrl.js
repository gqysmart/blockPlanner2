/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .controller('SelectCityCtrl', SelectCityCtrl);

    /** @ngInject */
    function SelectCityCtrl() {

        var vm = this;


        vm.groupedItem = {};
        vm.groupedSelectItems = [
            { label: 'Group 1 - Option 1', value: 1, group: 'Group 1' },
            { label: 'Group 2 - Option 2', value: 2, group: 'Group 2' },
            { label: 'Group 1 - Option 3', value: 3, group: 'Group 1' },
            { label: 'Group 2 - Option 4', value: 4, group: 'Group 2' }
        ];

        vm.groupedByItem = {};
        vm.groupedBySelectItems = [
            { name: '南京市', province: '江苏省' },
            { name: '镇江市', province: '江苏省' },
            { name: '-', province: '上海市' },
        ];

        vm.groups = function() {
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

        vm.someGroupFn = function(item) {

            if (item.name[0] >= 'A' && item.name[0] <= 'M')
                return 'From A - M';
            if (item.name[0] >= 'N' && item.name[0] <= 'Z')
                return 'From N - Z';
        };





    }
})();