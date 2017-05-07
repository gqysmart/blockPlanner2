/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.soil', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('soil', {
                url: '/soil',
                templateUrl: 'app/pages/soilSellCondition/soil.html',
                title: '土地出让条件',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 40,
                    show: true
                },

            });
    }

})();