/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages')
        .controller('landInfoCtl', landInfoCtl);

    /** @ngInject */
    function landInfoCtl($scope, projectInfo, NgTableParams) {

        var vm = this;

        var dataCached = [
            { catagory: "规划设计", target: "容积率", relation: "<=", value: 2.0, unit: "" },
            { catagory: "规划设计", target: "容积率", relation: ">=", value: 1.0, unit: "" },
            { catagory: "规划设计", target: "覆盖率", relation: "<=", value: 25, unit: "%" },
            { catagory: "规划设计", target: "绿化率", relation: "<=", value: 2.0, unit: "" },
            { catagory: "销售", target: "可售商业面积", relation: "<=", value: 2000, unit: "平方米" },

        ];

        function formatRuleData(dataArray) {
            var newArray = [];
            var result = [];
            angular.forEach(dataArray, function(data) {
                if (!newArray[data.target]) {
                    newArray[data.target] = { catagory: data.catagory, target: data.target, rule: [data.relation + data.value], unit: data.unit };
                } else {
                    newArray[data.target].rule.push(data.relation + data.value);
                }
            });
            for (var obj in newArray) {
                newArray[obj].rule = newArray[obj].rule.join(",");
                result.push(newArray[obj]);
            }
            return result;

        }






        var originalData = dataCached;

        vm.cols = [{
                field: "catagory",
                title: "类别",
                sortable: "catagory",
                groupable: "catagory",
                show: false,
                dataType: "text"
            },
            {
                field: "target",
                title: "内容",
                sortable: "target",
                show: true,
                dataType: "number"
            },
            {
                field: "relation",
                title: "关系",
                show: true,
                dataType: "string"
            },
            {
                field: "value",
                title: "值",
                show: true,
                dataType: "number"
            },
            {
                field: "unit",
                title: "单位",
                dataType: "string"
            },
            {
                field: "action",
                title: "操作",
                dataType: "command"
            }
        ];

        var initParams = {
            count: 5,
            group: {
                catagory: "desc"
            }
        };
        var initSetting = {
            counts: [],
            paginationMaxBlocks: 5,
            paginationMinBlocks: 1,
            groupOptions: {
                isExpanded: true
            },
            dataset: dataCached

        };

        vm.tableParams = new NgTableParams(initParams, initSetting);

        vm.newRule = {};

        vm.add = function() {
            if (vm.newRule == {}) { return } else {
                var total = vm.tableParams.total();
                vm.tableParams.settings().dataset.unshift({
                    catagory: vm.newRule.item.catagory,
                    target: vm.newRule.item.target,
                    relation: vm.newRule.relation || "==",
                    value: vm.newRule.value,
                    unit: vm.newRule.unit.name
                });
                vm.tableParams.total(total + 1);
                vm.tableParams.sorting({});
                vm.tableParams.page(1);
                vm.tableParams.reload();

            }
            vm.newRule = {};

        }

        vm.del = function(row) {
            _.remove(vm.tableParams.settings().dataset, function(item) {
                return row === item;
            });

            vm.tableParams.reload().then(function(data) {
                if (data.length === 0 && vm.tableParams.total() > 0) {
                    vm.tableParams.page(vm.tableParams.page() - 1);
                    vm.tableParams.reload();
                }
            });

        }

    }
})();