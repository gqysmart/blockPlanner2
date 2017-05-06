/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project')
        .service('projectDetails', projectDetails);
    var urlRule = "/project/rule";
    var cityList = {
        groupBy: "province",
        descBy: "city",
        list: [
            { city: '南京市', province: '江苏省' },
            { city: '镇江市', province: '江苏省' },
            { city: '苏州市', province: '江苏省' },
            { city: '上海市', province: '直辖市' },
            { city: "重庆市", province: "直辖市" },
            { city: "广州市", province: "广东省" }
        ],
        htmlDesc: "city"
    };

    /** @ngInject */
    function projectDetails($q, $http, $timeout, $document) {
        this.getProjectRule = function(ruleQName) {
            var data = { projectTag: $document.find("#projectTag")[0].value, rule: ruleQName };

            return $http({ method: "POST", url: urlRule, data: data });
        }
    }
})();