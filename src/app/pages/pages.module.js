/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages', [
            'ui.router',
            'BlurAdmin.pages.dashboard',
            "BlurAdmin.pages.projectInfo"
            // 'BlurAdmin.pages.charts',
        ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
        $urlRouterProvider.otherwise('/dashboard');

        baSidebarServiceProvider.addStaticItem({
            title: 'Pages',
            icon: 'ion-document',
            subMenu: [{
                title: '登录',
                fixedHref: '/login',

            }, {
                title: '注册',
                fixedHref: '/signup',

            }, {
                title: 'User Profile',
                stateRef: 'profile'
            }]
        });

    }

})();