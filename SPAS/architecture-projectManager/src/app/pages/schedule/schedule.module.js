/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.schedule', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('schedule', {
                url: '/schedule',
                templateUrl: 'app/pages/schedule/schedule.html',
                title: '进度计划',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 20,
                    show: true
                },

            });
    }

})();