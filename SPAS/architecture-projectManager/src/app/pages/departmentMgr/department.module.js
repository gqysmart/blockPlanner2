/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.department', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('department', {
                url: '/department',
                templateUrl: 'app/pages/departmentMgr/department.html',
                title: '部门管控',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 30,
                    show: true
                },

            });
    }

})();