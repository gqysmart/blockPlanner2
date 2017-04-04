/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.cost', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('cost', {
                url: '/cost',
                template: '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
                title: '成本计算规则',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 30,
                    show: true
                },

            })
            .state('cost.rules', {
                url: '/costRules',
                templateUrl: "app/pages/cost/costItemsShow.html",
                title: '成本规则列表',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 0,
                    show: true
                },

            })
            .state('cost.ruleDetail', {
                url: '/costRuleDetail',
                params: { rule: null },
                templateUrl: "app/pages/cost/costRuleDetail.html",
                title: '编辑成本计算规则',
                controller: "ruleDetailCtl",
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 10,
                    show: true
                },

            });
    }

})();