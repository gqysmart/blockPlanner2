/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.plan', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('plan', {
                url: '/plan',
                templateUrl: 'app/pages/plan/plan.html',
                title: '方案管理',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 60,
                    show: true
                },

            });
    }

})();