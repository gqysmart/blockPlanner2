/**
 * 
 * 
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.dashboard')
        .controller('dashboardCtl', dashboardCtl);

    /** @ngInject */
    function dashboardCtl(projectDetails) {
        var vm = this;
        this.groups = [{
            editable: false,
            name: "项目描述",
            items: [{
                name: "项目名称",
                style: "D0",
                value: "xxxxxx",
                oldValue: "xxxxxx"
            }, {
                name: "项目地址",
                tag: "78654321",
                style: "D1",
                value: { "city": "南京市", "province": "江苏省" },
                oldValue: { "city": "南京市", "province": "江苏省" },
                options: {
                    groupBy: "province",
                    descBy: "city",
                    list: [
                        { city: '南京市', province: '江苏省' },
                        { city: '镇江市', province: '江苏省' },
                        { city: '上海市', province: '直辖市' },
                        { city: "重庆市", province: "直辖市" },
                        { city: "广州市", province: "广东省" }
                    ],
                    htmlDesc: "city"

                }
            }, {
                name: "项目地址",
                tag: "78654321",
                style: "D1",
                value: { "city": "南京市", "province": "江苏省" },
                oldValue: { "city": "南京市", "province": "江苏省" },
                options: {
                    groupBy: "province",
                    descBy: "city",
                    list: [
                        { city: '南京市', province: '江苏省' },
                        { city: '镇江市', province: '江苏省' },
                        { city: '上海市', province: '直辖市' },
                        { city: "重庆市", province: "直辖市" },
                        { city: "广州市", province: "广东省" }
                    ],
                    htmlDesc: "city"

                }
            }, {
                name: "项目地址",
                tag: "78654321",
                style: "D1",
                value: { "city": "南京市", "province": "江苏省" },
                oldValue: { "city": "南京市", "province": "江苏省" },
                options: {
                    groupBy: "province",
                    descBy: "city",
                    list: [
                        { city: '南京市', province: '江苏省' },
                        { city: '镇江市', province: '江苏省' },
                        { city: '上海市', province: '直辖市' },
                        { city: "重庆市", province: "直辖市" },
                        { city: "广州市", province: "广东省" }
                    ],
                    htmlDesc: "city"

                }
            }, {
                name: "项目地址",
                tag: "78654321",
                style: "D1",
                value: { "city": "南京市", "province": "江苏省" },
                oldValue: { "city": "南京市", "province": "江苏省" },
                options: {
                    groupBy: "province",
                    descBy: "city",
                    list: [
                        { city: '南京市', province: '江苏省' },
                        { city: '镇江市', province: '江苏省' },
                        { city: '上海市', province: '直辖市' },
                        { city: "重庆市", province: "直辖市" },
                        { city: "广州市", province: "广东省" }
                    ],
                    htmlDesc: "city"
                }
            }]
        }, {
            editable: false,
            name: "项目2",
            items: [{
                name: "项目222",
                style: "D1",
                value: "yyyyyy"
            }]
        }];

        vm.save = function(group) {
            var dirties = [];
            for (var i = 0; i < group.items.length; i++) {

                var item = group.items[i];
                if (!_.isEqual(item.value, item.oldValue)) {
                    var obj = {};
                    obj.value = item.value;
                    obj.tag = item.tag;
                    dirties.push(obj);
                }
            }
            projectInfo.modifyRuleValue(dirties).then(function(res) {
                group.editable = false;
            }, function(res) {
                group.editable = false;
                console.log("failed to save.");
            });
        };

        //
        projectDetails.getProjectRule("江苏嘉城/项目/项目概况").then(function(res) {
            vm.summares = res;
        });

    };
})();