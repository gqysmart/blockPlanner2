/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.blockPlanner', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('blockPlanner', {
                url: '/blockPlanner',
                templat: '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
                title: '规划测算',
                sidebarMeta: {
                    icon: 'ion-compose',
                    order: 20,
                    show: true
                },
            })
            .state('blockPlanner.planManager', {
                url: '/blockPlannerManager',
                templateUrl: "app/pages/blockPlanner/blockPlannerManager.html",
                title: '方案管理',
                sidebarMeta: {
                    order: 0,
                    show: true
                }
            })
            .state('blockPlanner.planEdit', {
                url: '/blockPlannerEdit',
                templateUrl: 'app/pages/projectInfo/projectInfoEditable.html',
                title: '项目信息',
                sidebarMeta: {
                    order: 0,
                    show: true
                }
            });

    }
})();