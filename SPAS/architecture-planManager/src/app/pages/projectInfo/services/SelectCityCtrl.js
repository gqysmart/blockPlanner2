/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project')
        .controller('SelectCityCtrl', SelectCityCtrl);

    /** @ngInject */
    function SelectCityCtrl($scope) {

        var vm = this;
        vm.disabled = undefined;

        vm.cityOfProvince = [
            { id: 0, city: '南京市', province: '江苏省' },
            { id: 1, city: '镇江市', province: '江苏省' },
            { id: 2, city: '上海市', province: '直辖市' },
            { id: 3, city: "重庆市", province: "直辖市" },
            { id: 4, city: "广州市", province: "广东省" }
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

        $scope.user = {
            status: 2
        };

        $scope.statuses = [
            { value: 1, text: 'status1' },
            { value: 2, text: 'status2' },
            { value: 3, text: 'status3' },
            { value: 4, text: 'status4' }
        ];








    }
})();