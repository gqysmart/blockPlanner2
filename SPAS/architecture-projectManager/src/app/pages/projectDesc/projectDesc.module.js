/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectDesc', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('projectDesc', {
                url: '/projectDesc',
                templateUrl: 'app/pages/projectDesc/projectDesc.html',
                title: '项目描述',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 10,
                    show: true
                },

            });
    }

})();