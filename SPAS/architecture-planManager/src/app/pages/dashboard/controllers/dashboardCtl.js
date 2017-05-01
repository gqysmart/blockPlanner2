/**
 * 
 * 
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.dashboard')
        .controller('dashboardCtl', dashboardCtl);

    /** @ngInject */
    function dashboardCtl() {
        this.groups = [{
            editable: true,
            name: "项目描述",
            items: [{
                name: "项目名称",
                style: "D0",
                value: "xxxxxx"
            }, {
                name: "项目地址",
                style: "D0",
                value: "江苏南京"
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




    };
})();