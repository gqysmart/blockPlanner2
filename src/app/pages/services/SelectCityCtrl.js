/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages')
        .controller('SelectCityCtrl', SelectCityCtrl);

    /** @ngInject */
    function SelectCityCtrl() {

        var vm = this;
        vm.disabled = undefined;

        vm.cityOfProvince = [
            { city: '南京市', province: '江苏省' },
            { city: '镇江市', province: '江苏省' },
            { city: '上海市', province: '直辖市' },
            { city: "重庆市", province: "直辖市" },
            { city: "广州市", province: "广东省" }
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