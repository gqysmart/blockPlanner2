/**
 * 
 * 
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.dashboard')
        .controller('dashboardCtl', dashboardCtl);
    var cityOptions = {
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
    };

    /** @ngInject */
    function dashboardCtl(projectDetails) {
        var vm = this;

        vm.save = function(group) {
            var dirties = [];
            for (var i = 0; i < group.items.length; i++) {

                var item = group.items[i];
                switch (item.style) {
                    case "D4":
                        continue;
                        break;
                }
                if (!_.isEqual(item.value, item.oldValue)) {
                    var obj = {};
                    obj.value = item.value;
                    obj.style = item.style;
                    obj.tag = item.tag;
                    dirties.push(obj);
                }
            }
            projectDetails.modifyRulesValue(dirties).then(function(res) {
                group.editable = false;
            }, function(res) {
                group.editable = false;
                console.log("failed to save.");
            });
        };

        //
        projectDetails.getProjectRule("江苏嘉城/项目/项目概况").then(function(res) {
            vm.groups = [];

            var _groups = res.data.iValue;
            for (var i = 0; i < _groups.length; i++) {
                var _group = {};
                _group.name = _groups[i].pretty;
                _group.editable = false;
                _group.items = [];
                for (var j = 0; j < _groups[i].iValue.length; j++) {
                    var item = {};
                    item.name = _groups[i].iValue[j].pretty;
                    item.tag = _groups[i].iValue[j].name;
                    item.style = _groups[i].iValue[j].style;
                    item.html = "app/pages/widgets/rule." + item.style + ".display.html";
                    item.value = _groups[i].iValue[j].iValue;
                    if (item.style === "D2") {
                        var time = new Date(item.value);
                        item.value = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate()
                    }
                    item.oldValue = _.cloneDeep(item.value);
                    if (item.style === "D1") {
                        item.options = cityOptions;
                    }
                    _group.items.push(item);
                }

                vm.groups.push(_group);
            }
        });

    };
})();