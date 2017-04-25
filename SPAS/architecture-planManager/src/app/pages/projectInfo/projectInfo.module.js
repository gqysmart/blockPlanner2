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
            .state('projectInfo', {
                url: '/projectInfo',
                template: '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
                abstract: true,
                title: '项目信息',
                sidebarMeta: {
                    icon: 'ion-compose',
                    order: 10,
                    show: true
                },
            })
            .state('projectInfo.edit', {
                url: '/projectInfoEdit',
                templateUrl: 'app/pages/projectInfo/projectInfoEditable.html',
                title: '项目信息',
                sidebarMeta: {
                    order: 0,
                    show: false
                },
            })
            .state("projectInfo.landInfoEdit", {
                url: "/landInfoEdit",
                templateUrl: "app/pages/projectInfo/landAccordanceEditable.html",
                title: "土地出让约定",
                sidebarMeta: {
                    icon: "ion-android-home",
                    order: 10,
                    show: false
                }

                // .state('projectInfo.show', {
                //     url: '/infoShow',
                //     templateUrl: 'app/pages/form/wizard/wizard.html',
                //     controller: 'WizardCtrl',
                //     controllerAs: 'vm',
                //     title: 'Form Wizard',
                //     sidebarMeta: {
                //         order: 200,
                //     },
                // });
            })
    }
})();