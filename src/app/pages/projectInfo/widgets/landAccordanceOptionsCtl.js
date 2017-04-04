/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages')
        .controller('landAccordanceOptionsCtl', landAccordanceOptionsCtl);

    /** @ngInject */
    function landAccordanceOptionsCtl($scope, projectInfo) {

        var vm = this;

        // vm.landAccordanceOptions = [
        //     { catagory: "规划设计", target: "最大容积率", no: 10000, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大覆盖率", no: 10001, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最小容积率", no: 10002, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大容积率", no: 10003, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大商业面积", no: 10004, default: { value: 0, unit: "㎡" } },

        //     { catagory: "销售", target: "可售面积", no: 20000, default: { value: 100, unit: "%" } },
        //     { catagory: "销售", target: "地面停车位是否可售", no: 20001, default: { value: 1, unit: "" } },


        // ];
        vm.landAccordanceOptions = [
            { catagory: "规划设计", target: "容积率" },
            { catagory: "规划设计", target: "覆盖率" },
            { catagory: "规划设计", target: "绿化率" },
            { catagory: "规划设计", target: "商业面积" },
            { catagory: "规划设计", target: "住宅面积" },
            { catagory: "销售", target: "商业可售面积" },
            { catagory: "销售", target: "地面停车位可售比例" },
        ];
        vm.unitOptions = [
            { catagory: "面积", name: "平方米" },
            { catagory: "面积", name: "公顷" },
            { catagory: "面积", name: "亩" },

            { catagory: "金融", name: "元" },
            { catagory: "金融", name: "亿元" },
            { catagory: "金融", name: "万元" },

            { catagory: "比例", name: "%" },
            { catagory: "比例", name: "-" }

        ];
        vm.relationOptions = [">", ">=", "<", "<=", "=="];
    }


})();