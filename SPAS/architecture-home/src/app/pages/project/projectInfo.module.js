/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('projects', {
                url: '/projects',
                template: '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
                abstract: true,
                title: '项目信息',
                sidebarMeta: {
                    icon: 'ion-compose',
                    order: 10,
                    show: true
                },
            })
            .state('projects.infos', {
                url: '/projectsInfo',
                templateUrl: 'app/pages/project/projectInfoShow.html',
                title: '项目信息',
                sidebarMeta: {
                    order: 0,
                    show: false
                },
            });

    }
})();