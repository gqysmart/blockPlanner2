/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    routeConfig.$inject = ["$urlRouterProvider", "baSidebarServiceProvider"];
    angular.module('BlurAdmin.pages', [
            'ui.router',
            'ui.select',
            'ui.tree',
            'ngTable',
            'ngSanitize',
            'ui.bootstrap',
            'BlurAdmin.pages.dashboard',
            "BlurAdmin.pages.projectInfo",
            "BlurAdmin.pages.blockPlanner",
            "BlurAdmin.pages.cost",

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
/**
 * @author v.lugovsky
 * created on 15.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.theme', [
        // 'toastr',
        // 'chart.js',
        //    'angular-chartist',
        //  'angular.morris-chart',
        // 'textAngular',
        'BlurAdmin.theme.components',
        // 'BlurAdmin.theme.inputs'
    ]);

})();
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
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
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
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
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('BlurAdmin.pages.dashboard', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'app/pages/dashboard/dashboard.html',
                title: 'Dashboard',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 0,
                    show: true
                },

            });
    }

})();
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('BlurAdmin.pages.projectInfo', [])
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
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.theme.components', [
        'ui.bootstrap',
        'ui.slimscroll'

    ]);

})();
'use strict';

angular.module('BlurAdmin', [
    // 'ngAnimate',
    // 'ui.bootstrap',
    // 'ui.sortable',
    'ui.router',
    // 'ngTouch',
    // 'toastr',
    // 'smart-table',
    // "xeditable",
    // 'ngJsTree',
    // 'angular-progress-button-styles',

    'BlurAdmin.theme',
    'BlurAdmin.pages'
]);
 angular.module('BlurAdmin.pages')
     .service("dataSwapCenter", dataSwapCenter);

 function dataSwapCenter() {
     var dataPool = { "goodcity.plan.constructArea": ["hh"] };

     this.publishData = function(dataName, value) {

         dataPool[dataName] = value;
     };
     this.listenToData = function(dataName, cb) {
         if (dataPool[dataName]) {
             dataPool[dataName].push(cb);
         } else {
             dataPool[dataName] = [cb];
         }
     };

     this.getDataValue = function(dataName, cb) {
         var value = dataPool[dataName];

         return cb(value);


     };

 };
/**
 * Created by k.danovsky on 13.05.2016.
 */

(function () {
  'use strict';

  config.$inject = ["baConfigProvider", "colorHelper", "$provide"];
  uiViewScrollDecorator.$inject = ["$delegate", "$anchorScroll", "baUtil"];
  angular.module('BlurAdmin.theme')
    .config(config);

  /** @ngInject */
  function config(baConfigProvider, colorHelper, $provide) {
    $provide.decorator('$uiViewScroll', uiViewScrollDecorator);
    //baConfigProvider.changeTheme({blur: true});
    //
    //baConfigProvider.changeColors({
    //  default: 'rgba(#000000, 0.2)',
    //  defaultText: '#ffffff',
    //  dashboard: {
    //    white: '#ffffff',
    //  },
    //});
  }

  /** @ngInject */
  function uiViewScrollDecorator($delegate, $anchorScroll, baUtil) {
    return function (uiViewElement) {
      if (baUtil.hasAttr(uiViewElement, "autoscroll-body-top")) {
        $anchorScroll();
      } else {
        $delegate(uiViewElement);
      }
    };
  }
})();

/**
 * Created by k.danovsky on 13.05.2016.
 */

(function () {
  'use strict';

  configProvider.$inject = ["colorHelper"];
  var basic = {
    default: '#ffffff',
    defaultText: '#666666',
    border: '#dddddd',
    borderDark: '#aaaaaa',
  };

  // main functional color scheme
  var colorScheme = {
    primary: '#209e91',
    info: '#2dacd1',
    success: '#90b900',
    warning: '#dfb81c',
    danger: '#e85656',
  };

  // dashboard colors for charts
  var dashboardColors = {
    blueStone: '#005562',
    surfieGreen: '#0e8174',
    silverTree: '#6eba8c',
    gossip: '#b9f2a1',
    white: '#10c4b5',
  };

  angular.module('BlurAdmin.theme')
    .provider('baConfig', configProvider);

  /** @ngInject */
  function configProvider(colorHelper) {
    var conf = {
      theme: {
        blur: false,
      },
      colors: {
        default: basic.default,
        defaultText: basic.defaultText,
        border: basic.border,
        borderDark: basic.borderDark,

        primary: colorScheme.primary,
        info: colorScheme.info,
        success: colorScheme.success,
        warning: colorScheme.warning,
        danger: colorScheme.danger,

        primaryLight: colorHelper.tint(colorScheme.primary, 30),
        infoLight: colorHelper.tint(colorScheme.info, 30),
        successLight: colorHelper.tint(colorScheme.success, 30),
        warningLight: colorHelper.tint(colorScheme.warning, 30),
        dangerLight: colorHelper.tint(colorScheme.danger, 30),

        primaryDark: colorHelper.shade(colorScheme.primary, 15),
        infoDark: colorHelper.shade(colorScheme.info, 15),
        successDark: colorHelper.shade(colorScheme.success, 15),
        warningDark: colorHelper.shade(colorScheme.warning, 15),
        dangerDark: colorHelper.shade(colorScheme.danger, 15),

        dashboard: {
          blueStone: dashboardColors.blueStone,
          surfieGreen: dashboardColors.surfieGreen,
          silverTree: dashboardColors.silverTree,
          gossip: dashboardColors.gossip,
          white: dashboardColors.white,
        },
      }
    };

    conf.changeTheme = function(theme) {
      angular.merge(conf.theme, theme)
    };

    conf.changeColors = function(colors) {
      angular.merge(conf.colors, colors)
    };

    conf.$get = function () {
      delete conf.$get;
      return conf;
    };
    return conf;
  }
})();

/**
 * @author v.lugovsky
 * created on 15.12.2015
 */
(function() {
    'use strict';

    var IMAGES_ROOT = 'img/';

    angular.module('BlurAdmin.theme')
        .constant('layoutSizes', {
            resWidthCollapseSidebar: 1200,
            resWidthHideSidebar: 500
        })
        .constant('layoutPaths', {
            images: {
                root: IMAGES_ROOT,
                profile: IMAGES_ROOT + 'profile/',
                amMap: 'assets/img/theme/vendor/ammap//dist/ammap/images/',
                amChart: 'assets/img/theme/vendor/amcharts/dist/amcharts/images/'
            }
        })
        .constant('colorHelper', {
            tint: function(color, weight) {
                return mix('#ffffff', color, weight);
            },
            shade: function(color, weight) {
                return mix('#000000', color, weight);
            },
        });

    function shade(color, weight) {
        return mix('#000000', color, weight);
    }

    function tint(color, weight) {
        return mix('#ffffff', color, weight);
    }

    //SASS mix function
    function mix(color1, color2, weight) {
        // convert a decimal value to hex
        function d2h(d) {
            return d.toString(16);
        }
        // convert a hex value to decimal
        function h2d(h) {
            return parseInt(h, 16);
        }

        var result = "#";
        for (var i = 1; i < 7; i += 2) {
            var color1Part = h2d(color1.substr(i, 2));
            var color2Part = h2d(color2.substr(i, 2));
            var resultPart = d2h(Math.floor(color2Part + (color1Part - color2Part) * (weight / 100.0)));
            result += ('0' + resultPart).slice(-2);
        }
        return result;
    }
})();
/**
 * @author v.lugovksy
 * created on 15.12.2015
 */
(function() {
    'use strict';

    themeRun.$inject = ["$timeout", "$rootScope", "layoutPaths", "preloader", "$q", "baSidebarService", "themeLayoutSettings"];
    angular.module('BlurAdmin.theme')
        .run(themeRun);

    /** @ngInject */
    function themeRun($timeout, $rootScope, layoutPaths, preloader, $q, baSidebarService, themeLayoutSettings) {
        var whatToWait = [
            // preloader.loadAmCharts(),
            //    $timeout(3000)
        ];

        var theme = themeLayoutSettings;
        if (theme.blur) {
            if (theme.mobile) {
                whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg-mobile.jpg'));
            } else {
                whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg.jpg'));
                whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg-blurred.jpg'));
            }
        }

        $q.all(whatToWait).then(function() {
            $rootScope.$pageFinishedLoading = true;
        });

        $timeout(function() {
            if (!$rootScope.$pageFinishedLoading) {
                $rootScope.$pageFinishedLoading = true;
            }
        }, 7000);

        $rootScope.$baSidebarService = baSidebarService;
    }

})();
/**
 * Created by k.danovsky on 12.05.2016.
 */

(function () {
  'use strict';

  themeLayoutSettings.$inject = ["baConfig"];
  angular.module('BlurAdmin.theme')
    .service('themeLayoutSettings', themeLayoutSettings);

  /** @ngInject */
  function themeLayoutSettings(baConfig) {
    var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|windows phone/).test(navigator.userAgent.toLowerCase());
    var mobileClass = isMobile ? 'mobile' : '';
    var blurClass = baConfig.theme.blur ? 'blur-theme' : '';
    angular.element(document.body).addClass(mobileClass).addClass(blurClass);

    return {
      blur: baConfig.theme.blur,
      mobile: isMobile,
    }
  }

})();


/**
 * @author p.maslava
 * created on 28.11.2016
 */

(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .filter('groupSelectpickerOptions', GroupSelectpickerOptions);

    /** @ngInject */
    function GroupSelectpickerOptions() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    }
})();
(function () {
  'use strict';

  angular.module('BlurAdmin.theme')
      .directive('scrollPosition', scrollPosition);

  /** @ngInject */
  function scrollPosition() {
    return {
      scope: {
        scrollPosition: '=',
        maxHeight: '='
      },
      link: function (scope) {
        $(window).on('scroll', function() {
          var scrollTop = $(window).scrollTop() > scope.maxHeight;
          if (scrollTop !== scope.prevScrollTop) {
            scope.$apply(function() {
              scope.scrollPosition = scrollTop;
            });
          }
          scope.prevScrollTop = scrollTop;
        });
      }
    };
  }

})();
/**
 * Animated load block
 */
(function () {
  'use strict';

  zoomIn.$inject = ["$timeout", "$rootScope"];
  angular.module('BlurAdmin.theme')
      .directive('zoomIn', zoomIn);

  /** @ngInject */
  function zoomIn($timeout, $rootScope) {
    return {
      restrict: 'A',
      link: function ($scope, elem) {
        var delay = 1000;

        if ($rootScope.$pageFinishedLoading) {
          delay = 100;
        }

        $timeout(function () {
          elem.removeClass('full-invisible');
          elem.addClass('animated zoomIn');
        }, delay);
      }
    };
  }

})();
/**
 * @author v.lugovsky
 * created on 03.05.2016
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme')
      .service('baUtil', baUtil);

  /** @ngInject */
  function baUtil() {

    this.isDescendant = function(parent, child) {
      var node = child.parentNode;
      while (node != null) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    this.hexToRGB = function(hex, alpha) {
      var r = parseInt( hex.slice(1,3), 16 );
      var g = parseInt( hex.slice(3,5), 16 );
      var b = parseInt( hex.slice(5,7), 16 );
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    };

    this.hasAttr = function (elem, attrName) {
      var attr = $(elem).attr(attrName);
      return (typeof attr !== typeof undefined && attr !== false);
    }
  }
})();

/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  fileReader.$inject = ["$q"];
  angular.module('BlurAdmin.theme')
      .service('fileReader', fileReader);

  /** @ngInject */
  function fileReader($q) {
    var onLoad = function(reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.resolve(reader.result);
        });
      };
    };

    var onError = function (reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.reject(reader.result);
        });
      };
    };

    var onProgress = function(reader, scope) {
      return function (event) {
        scope.$broadcast('fileProgress',
            {
              total: event.total,
              loaded: event.loaded
            });
      };
    };

    var getReader = function(deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      reader.onprogress = onProgress(reader, scope);
      return reader;
    };

    var readAsDataURL = function (file, scope) {
      var deferred = $q.defer();

      var reader = getReader(deferred, scope);
      reader.readAsDataURL(file);

      return deferred.promise;
    };

    return {
      readAsDataUrl: readAsDataURL
    };
  }
})();
/**
 * @author a.demeshko
 * created on 3/1/16
 */
(function () {
  'use strict';

  preloader.$inject = ["$q"];
  angular.module('BlurAdmin.theme')
    .service('preloader', preloader);

  /** @ngInject */
  function preloader($q) {
    return {
      loadImg: function (src) {
        var d = $q.defer();
        var img = new Image();
        img.src = src;
        img.onload = function(){
          d.resolve();
        };
        return d.promise;
      },
      loadAmCharts : function(){
        var d = $q.defer();
        AmCharts.ready(function(){
          d.resolve();
        });
        return d.promise;
      }
    }
  }

})();
/**
 * @author a.demeshko
 * created on 12/21/15
 */
(function () {
  'use strict';

  stopableInterval.$inject = ["$window"];
  angular.module('BlurAdmin.theme')
    .service('stopableInterval', stopableInterval);

  /** @ngInject */
  function stopableInterval($window) {
    return {
      start: function (interval, calback, time) {
        function startInterval() {
          return interval(calback, time);
        }

        var i = startInterval();

        angular.element($window).bind('focus', function () {
          if (i) interval.cancel(i);
          i = startInterval();
        });

        angular.element($window).bind('blur', function () {
          if (i) interval.cancel(i);
        });
      }
    }
  }

})();
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.cost')
        .controller('BasicExampleCtrl', ['$scope', "costInfo", function($scope, costInfo) {
            $scope.remove = function(scope) {
                scope.remove();
            };

            $scope.toggle = function(scope) {
                scope.toggle();
            };

            $scope.moveLastToTheBeginning = function() {
                var a = $scope.data.pop();
                $scope.data.splice(0, 0, a);
            };

            $scope.newSubItem = function(scope) {
                var nodeData = scope.$modelValue;
                nodeData.nodes.push({
                    id: nodeData.id * 10 + nodeData.nodes.length,
                    title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                    nodes: []
                });
            };

            $scope.collapseAll = function() {
                $scope.$broadcast('angular-ui-tree:collapse-all');
            };

            $scope.expandAll = function() {
                $scope.$broadcast('angular-ui-tree:expand-all');
            };

            costInfo.loadCostClass(function(classInfo) {
                $scope.data = classInfo;


            });

        }]);

}());
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    costRuleDetailCtl.$inject = ["$q", "$http", "$timeout"];
    angular.module('BlurAdmin.pages.cost')
        .controller('costRuleDetailCtl', costRuleDetailCtl);
    var projectInfoCache = {};
    var cached = false;

    /** @ngInject */
    function costRuleDetailCtl($q, $http, $timeout) {
        this.load = function(cb) {
            if (cached) {
                if (cb) {
                    return cb(projectInfoCache);
                }

            } else {
                $timeout(function() {
                    projectInfoCache = {
                        name: "xxxx",
                        location: { city: '南京市', province: '江苏省' },
                        number: "G235,G240",
                        status: { task: '测算评估', stage: '拿地前' },

                    };
                    cached = true;
                    if (cb) {
                        return cb(projectInfoCache);
                    }

                }, 5600);


            }


        };

        this.save = function(pi, cb) {
            //send save quest to server.

        };

    }



    function qulifiedName2TermID(qName) {
        var termID = 0;


        return termID;
    };

    function termID2QulifiedName(termID) {
        function findMatchedTermObject(termID) {
            return {};
        }

        function trimEndPoint(name) {
            return name;
        }

        var matchedTermObject = findMatchedTermObject(termID);
        var parentTermObject = null;
        var qulifiedName = matchedTermObject.name.en;
        while (matchedTermObject.parentID != 0) {
            parentTermObject = findMatchedTermObject(matchedTermObject.parentID);
            qulifiedName = parentTermObject.name.en + "@" + qulifiedName;
            matchedTermObject = parentTermObject;
        }
    };



    var costItemDescList = [{
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "WS@http://www.goodctiy.net/{{1}}/{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        costID: 4,
        NO: 4,
        ParentID: 0,
        level: 1,
        name: "开发期间税费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        costID: 5,
        NO: 1,
        ParentID: 1,
        level: 2,
        name: "土地费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 6,
        NO: 2,
        ParentID: 1,
        level: 2,
        name: "前期工程费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, , {
        costID: 7,
        NO: 3,
        ParentID: 1,
        level: 2,
        name: "建筑安装工程费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 8,
        NO: 7,
        ParentID: 1,
        level: 2,
        name: "基础设施费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 9,
        NO: 4,
        ParentID: 1,
        level: 2,
        name: "公共配套设施费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 10,
        NO: 5,
        ParentID: 1,
        level: 2,
        name: "不可预见费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 11,
        NO: 6,
        ParentID: 1,
        level: 2,
        name: "开发间接费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 12,
        NO: 8,
        ParentID: 1,
        level: 2,
        name: "资本化利息",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }];
})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    costInfo.$inject = ["$q", "$http", "$timeout"];
    angular.module('BlurAdmin.pages.cost')
        .service('costInfo', costInfo);
    var planCostClassCache = {};
    var cached = false;

    /** @ngInject */
    function costInfo($q, $http, $timeout) {
        this.loadCostClass = function(cb) {
            if (cached) {
                if (cb) {
                    return cb(planCostClassCache);
                }

            } else {
                $timeout(function() {
                    planCostClassCache = {
                        name: "xxxx",
                        costClass: [{
                            name: "总成本",
                            id: 0,
                            childItems: [{
                                    name: "建设成本",
                                    id: 0,
                                    childItems: [
                                        { name: "土地成本", id: 0, childItems: [] },
                                        { name: "前期成本", id: 0, childItems: [] },
                                        { name: "建安成本", id: 0, childItems: [] },
                                        { name: "基础设施费用", id: 0, childItems: [] },
                                        { name: "公共设施费用", id: 0, childItems: [] },
                                        { name: "未预见费用", id: 0, childItems: [] },
                                        { name: "间接费", id: 0, childItems: [] },
                                        { name: "财务利息", id: 0, childItems: [] },
                                    ]
                                },
                                { name: "期间成本", id: 0, childItems: [] },
                                { name: "期间投资不计税", id: 0, childItems: [] },
                                { name: "开发期间税", id: 0, childItems: [] },

                            ]
                        }]

                    };
                    cached = true;
                    if (cb) {
                        return cb(planCostClassCache);
                    }

                }, 5600);


            }


        };

        this.save = function(pi, cb) {
            //send save quest to server.

        };

    };


    function qulifiedName2TermID(qName) {
        var termID = 0;


        return termID;
    };

    function termID2QulifiedName(termID) {
        function findMatchedTermObject(termID) {
            return {};
        }

        function trimEndPoint(name) {
            return name;
        }

        var matchedTermObject = findMatchedTermObject(termID);
        var parentTermObject = null;
        var qulifiedName = matchedTermObject.name.en;
        while (matchedTermObject.parentID != 0) {
            parentTermObject = findMatchedTermObject(matchedTermObject.parentID);
            qulifiedName = parentTermObject.name.en + "@" + qulifiedName;
            matchedTermObject = parentTermObject;
        }
    };



    var costItemDescList = [{
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "WS@http://www.goodctiy.net/{{1}}/{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        name: { refTermID: 37 },
        parentName: { refTermID: 28 },
        level: 1,
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        costID: 4,
        NO: 4,
        ParentID: 0,
        level: 1,
        name: "开发期间税费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }

    }, {
        costID: 5,
        NO: 1,
        ParentID: 1,
        level: 2,
        name: "土地费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 6,
        NO: 2,
        ParentID: 1,
        level: 2,
        name: "前期工程费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, , {
        costID: 7,
        NO: 3,
        ParentID: 1,
        level: 2,
        name: "建筑安装工程费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 8,
        NO: 7,
        ParentID: 1,
        level: 2,
        name: "基础设施费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 9,
        NO: 4,
        ParentID: 1,
        level: 2,
        name: "公共配套设施费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 10,
        NO: 5,
        ParentID: 1,
        level: 2,
        name: "不可预见费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 11,
        NO: 6,
        ParentID: 1,
        level: 2,
        name: "开发间接费",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }, {
        costID: 12,
        NO: 8,
        ParentID: 1,
        level: 2,
        name: "资本化利息",
        rules: {
            computeRule: {
                base: [{ name: { refTermID: 7 } }, { name: { refTermID: 27 } }],
                oper: "{{1}}x{{2}}",
                desc: "建筑面积*单方价格"
            },
            paymentRule: {
                base: [{ name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 27 } }, { name: { refTermID: 28 } }, { name: { refTermID: 28 } }],
                oper: "everyMonth[{{1}}~{{2}}]:{{1}}/{{2}} || time[{{1}} - 4 ]:{{2}}*{{3}} ",
                desc: "在期间，每月平均 ;然后 4个月后，一次性支付"
            }
        }
    }];
})();
/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .controller('SelectCityCtrl', SelectCityCtrl);

    /** @ngInject */
    function SelectCityCtrl() {

        var vm = this;
        vm.disabled = undefined;

        vm.cityOfProvince = [
            { city: '南京市', province: '江苏省' },
            { city: '镇江市', province: '江苏省' },
            { city: '上海市', province: '直辖市' },
            { city: "重庆市", province: "直辖市" },
            { city: "广州市", province: "广东省" }
        ];

        vm.cityShowGroupfn = function() {
            var groups = [];
            for (var i = 0; i < vm.groupedBySelectItems.length; i++) {
                var selectItem = vm.groupedBySelectItems[i];
                var haveGroupped = false;
                for (var j = 0; j < groups.length; j++) {
                    var groupItem = groups[j];
                    if (selectItem.province == groupItem) {
                        haveGroupped = true;
                        break;
                    }

                }
                if (!haveGroupped) {
                    groups.push(seletItem.province)
                }
            }

            return groups;

        };








    }
})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    projectInfo.$inject = ["$q", "$http", "$timeout"];
    angular.module('BlurAdmin.pages.projectInfo')
        .service('projectInfo', projectInfo);
    var projectInfoCache = {};
    var cached = false;

    /** @ngInject */
    function projectInfo($q, $http, $timeout) {
        this.load = function(cb) {
            if (cached) {
                if (cb) {
                    return cb(projectInfoCache);
                }

            } else {
                $timeout(function() {
                    projectInfoCache = {
                        name: "xxxx",
                        location: { city: '南京市', province: '江苏省' },
                        number: "G235,G240",
                        status: { task: '测算评估', stage: '拿地前' },

                    };
                    cached = true;
                    if (cb) {
                        return cb(projectInfoCache);
                    }

                }, 5600);


            }


        };

        this.save = function(pi, cb) {
            //send save quest to server.

        };

    }
})();
/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.projectInfo')
        .controller('ProjectStatusCtl', ProjectStatusCtl);

    /** @ngInject */
    function ProjectStatusCtl() {

        var vm = this;
        vm.disabled = undefined;

        vm.projectStatusList = [
            { task: '测算评估', stage: '拿地前' },
            { task: '施工图设计', stage: '设计' },
            { task: '招商', stage: '运维' },
            { task: '营造', stage: '施工' },
            { task: '规划设计', stage: '设计' },

        ];

        vm.cityShowGroupfn = function() {
            var groups = [];
            for (var i = 0; i < vm.groupedBySelectItems.length; i++) {
                var selectItem = vm.groupedBySelectItems[i];
                var haveGroupped = false;
                for (var j = 0; j < groups.length; j++) {
                    var groupItem = groups[j];
                    if (selectItem.province == groupItem) {
                        haveGroupped = true;
                        break;
                    }

                }
                if (!haveGroupped) {
                    groups.push(seletItem.province)
                }
            }

            return groups;

        };








    }
})();
/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    landAccordanceOptionsCtl.$inject = ["$scope", "projectInfo"];
    angular.module('BlurAdmin.pages')
        .controller('landAccordanceOptionsCtl', landAccordanceOptionsCtl);

    /** @ngInject */
    function landAccordanceOptionsCtl($scope, projectInfo) {

        var vm = this;

        // vm.landAccordanceOptions = [
        //     { catagory: "规划设计", target: "最大容积率", no: 10000, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大覆盖率", no: 10001, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最小容积率", no: 10002, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大容积率", no: 10003, default: { value: 0, unit: "" } },
        //     { catagory: "规划设计", target: "最大商业面积", no: 10004, default: { value: 0, unit: "㎡" } },

        //     { catagory: "销售", target: "可售面积", no: 20000, default: { value: 100, unit: "%" } },
        //     { catagory: "销售", target: "地面停车位是否可售", no: 20001, default: { value: 1, unit: "" } },


        // ];
        vm.landAccordanceOptions = [
            { catagory: "规划设计", target: "容积率" },
            { catagory: "规划设计", target: "覆盖率" },
            { catagory: "规划设计", target: "绿化率" },
            { catagory: "规划设计", target: "商业面积" },
            { catagory: "规划设计", target: "住宅面积" },
            { catagory: "销售", target: "商业可售面积" },
            { catagory: "销售", target: "地面停车位可售比例" },
        ];
        vm.unitOptions = [
            { catagory: "面积", name: "平方米" },
            { catagory: "面积", name: "公顷" },
            { catagory: "面积", name: "亩" },

            { catagory: "金融", name: "元" },
            { catagory: "金融", name: "亿元" },
            { catagory: "金融", name: "万元" },

            { catagory: "比例", name: "%" },
            { catagory: "比例", name: "-" }

        ];
        vm.relationOptions = [">", ">=", "<", "<=", "=="];
    }


})();
/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    landInfoCtl.$inject = ["$scope", "projectInfo", "NgTableParams"];
    angular.module('BlurAdmin.pages')
        .controller('landInfoCtl', landInfoCtl);

    /** @ngInject */
    function landInfoCtl($scope, projectInfo, NgTableParams) {

        var vm = this;

        var dataCached = [
            { catagory: "规划设计", target: "容积率", relation: "<=", value: 2.0, unit: "" },
            { catagory: "规划设计", target: "容积率", relation: ">=", value: 1.0, unit: "" },
            { catagory: "规划设计", target: "覆盖率", relation: "<=", value: 25, unit: "%" },
            { catagory: "规划设计", target: "绿化率", relation: "<=", value: 2.0, unit: "" },
            { catagory: "销售", target: "可售商业面积", relation: "<=", value: 2000, unit: "平方米" },

        ];

        function formatRuleData(dataArray) {
            var newArray = [];
            var result = [];
            angular.forEach(dataArray, function(data) {
                if (!newArray[data.target]) {
                    newArray[data.target] = { catagory: data.catagory, target: data.target, rule: [data.relation + data.value], unit: data.unit };
                } else {
                    newArray[data.target].rule.push(data.relation + data.value);
                }
            });
            for (var obj in newArray) {
                newArray[obj].rule = newArray[obj].rule.join(",");
                result.push(newArray[obj]);
            }
            return result;

        }






        var originalData = dataCached;

        vm.cols = [{
                field: "catagory",
                title: "类别",
                sortable: "catagory",
                groupable: "catagory",
                show: false,
                dataType: "text"
            },
            {
                field: "target",
                title: "内容",
                sortable: "target",
                show: true,
                dataType: "number"
            },
            {
                field: "relation",
                title: "关系",
                show: true,
                dataType: "string"
            },
            {
                field: "value",
                title: "值",
                show: true,
                dataType: "number"
            },
            {
                field: "unit",
                title: "单位",
                dataType: "string"
            },
            {
                field: "action",
                title: "操作",
                dataType: "command"
            }
        ];

        var initParams = {
            count: 5,
            group: {
                catagory: "desc"
            }
        };
        var initSetting = {
            counts: [],
            paginationMaxBlocks: 5,
            paginationMinBlocks: 1,
            groupOptions: {
                isExpanded: true
            },
            dataset: dataCached

        };

        vm.tableParams = new NgTableParams(initParams, initSetting);

        vm.newRule = {};

        vm.add = function() {
            if (vm.newRule == {}) { return } else {
                var total = vm.tableParams.total();
                vm.tableParams.settings().dataset.unshift({
                    catagory: vm.newRule.item.catagory,
                    target: vm.newRule.item.target,
                    relation: vm.newRule.relation || "==",
                    value: vm.newRule.value,
                    unit: vm.newRule.unit.name
                });
                vm.tableParams.total(total + 1);
                vm.tableParams.sorting({});
                vm.tableParams.page(1);
                vm.tableParams.reload();

            }
            vm.newRule = {};

        }

        vm.del = function(row) {
            _.remove(vm.tableParams.settings().dataset, function(item) {
                return row === item;
            });

            vm.tableParams.reload().then(function(data) {
                if (data.length === 0 && vm.tableParams.total() > 0) {
                    vm.tableParams.page(vm.tableParams.page() - 1);
                    vm.tableParams.reload();
                }
            });

        }

    }
})();
/**
 * @author p.maslava
 * created on 28.11.2016
 */
(function() {
    'use strict';

    projectInfoCtl.$inject = ["$scope", "projectInfo"];
    angular.module('BlurAdmin.pages')
        .controller('projectInfoCtl', projectInfoCtl);

    /** @ngInject */
    function projectInfoCtl($scope, projectInfo) {

        var vm = this;
        vm.projectInfo = {};

        vm.saveInfo = function() {
            projectInfo.save(vm.projectInfo);
        };

        projectInfo.load(function(content) {
            vm.projectInfo.name = content.name;
            vm.projectInfo.location = content.location;
            vm.projectInfo.number = "G235,G240";
            vm.projectInfo.status = { task: '测算评估', stage: '拿地前' };




        });
    }
})();
/**
 * @author v.lugovsky
 * created on 23.12.2015
 */
(function () {
  'use strict';

  /**
   * Includes basic panel layout inside of current element.
   */
  baPanel.$inject = ["baPanel", "baConfig"];
  angular.module('BlurAdmin.theme')
      .directive('baPanel', baPanel);

  /** @ngInject */
  function baPanel(baPanel, baConfig) {
    return angular.extend({}, baPanel, {
      template: function(el, attrs) {
        var res = '<div  class="panel ' + (baConfig.theme.blur ? 'panel-blur' : '') + ' full-invisible ' + (attrs.baPanelClass || '');
        res += '" zoom-in ' + (baConfig.theme.blur ? 'ba-panel-blur' : '') + '>';
        res += baPanel.template(el, attrs);
        res += '</div>';
        return res;
      }
    });
  }
})();

/**
 * @author v.lugovsky
 * created on 23.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme')
      .factory('baPanel', baPanel);

  /** @ngInject */
  function baPanel() {

    /** Base baPanel directive */
    return {
      restrict: 'A',
      transclude: true,
      template: function(elem, attrs) {
        var res = '<div class="panel-body" ng-transclude></div>';
        if (attrs.baPanelTitle) {
          var titleTpl = '<div class="panel-heading clearfix"><h3 class="panel-title">' + attrs.baPanelTitle + '</h3></div>';
          res = titleTpl + res; // title should be before
        }

        return res;
      }
    };
  }

})();

/**
 * @author v.lugovsky
 * created on 15.01.2016
 */
(function () {
  'use strict';

  baPanelBlur.$inject = ["baPanelBlurHelper", "$window", "$rootScope"];
  angular.module('BlurAdmin.theme')
      .directive('baPanelBlur', baPanelBlur);

  /** @ngInject */
  function baPanelBlur(baPanelBlurHelper, $window, $rootScope) {
    var bodyBgSize;

    baPanelBlurHelper.bodyBgLoad().then(function() {
      bodyBgSize = baPanelBlurHelper.getBodyBgImageSizes();
    });

    $window.addEventListener('resize', function() {
      bodyBgSize = baPanelBlurHelper.getBodyBgImageSizes();
    });

    return {
      restrict: 'A',
      link: function($scope, elem) {
        if(!$rootScope.$isMobile) {
          baPanelBlurHelper.bodyBgLoad().then(function () {
            setTimeout(recalculatePanelStyle);
          });
          $window.addEventListener('resize', recalculatePanelStyle);

          $scope.$on('$destroy', function () {
            $window.removeEventListener('resize', recalculatePanelStyle);
          });
        }

        function recalculatePanelStyle() {
          if (!bodyBgSize) {
            return;
          }
          elem.css({
            backgroundSize: Math.round(bodyBgSize.width) + 'px ' + Math.round(bodyBgSize.height) + 'px',
            backgroundPosition: Math.floor(bodyBgSize.positionX) + 'px ' + Math.floor(bodyBgSize.positionY) + 'px'
          });
        }

      }
    };
  }

})();

/**
 * @author v.lugovsky
 * created on 15.01.2016
 */
(function () {
  'use strict';

  baPanelBlurHelper.$inject = ["$q"];
  angular.module('BlurAdmin.theme')
      .service('baPanelBlurHelper', baPanelBlurHelper);

  /** @ngInject */
  function baPanelBlurHelper($q) {
    var res = $q.defer();
    var computedStyle = getComputedStyle(document.body, ':before');
    var image = new Image();
    image.src = computedStyle.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    image.onerror = function() {
      res.reject();
    };
    image.onload = function() {
      res.resolve();
    };

    this.bodyBgLoad = function() {
      return res.promise;
    };

    this.getBodyBgImageSizes = function() {
      var elemW = document.documentElement.clientWidth;
      var elemH = document.documentElement.clientHeight;
      if(elemW <= 640) return;
      var imgRatio = (image.height / image.width);       // original img ratio
      var containerRatio = (elemH / elemW);     // container ratio

      var finalHeight, finalWidth;
      if (containerRatio > imgRatio) {
        finalHeight = elemH;
        finalWidth = (elemH / imgRatio);
      } else {
        finalWidth = elemW;
        finalHeight = (elemW * imgRatio);
      }
      return { width: finalWidth, height: finalHeight, positionX: (elemW - finalWidth)/2, positionY: (elemH - finalHeight)/2};
    };
  }

})();

/**
 * @author v.lugovsky
 * created on 23.12.2015
 */
(function () {
  'use strict';

  /**
   * Represents current element as panel, adding all necessary classes.
   */
  baPanelSelf.$inject = ["baPanel"];
  angular.module('BlurAdmin.theme')
      .directive('baPanelSelf', baPanelSelf);

  /** @ngInject */
  function baPanelSelf(baPanel) {
    return angular.extend({}, baPanel, {
      link: function(scope, el, attrs) {
        el.addClass('panel panel-white');
        if (attrs.baPanelClass) {
          el.addClass(attrs.baPanelClass);
        }
      }
    });
  }

})();

/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  BaSidebarCtrl.$inject = ["$scope", "baSidebarService"];
  angular.module('BlurAdmin.theme.components')
    .controller('BaSidebarCtrl', BaSidebarCtrl);

  /** @ngInject */
  function BaSidebarCtrl($scope, baSidebarService) {

    $scope.menuItems = baSidebarService.getMenuItems();
    $scope.defaultSidebarState = $scope.menuItems[0].stateRef;

    $scope.hoverItem = function ($event) {
      $scope.showHoverElem = true;
      $scope.hoverElemHeight =  $event.currentTarget.clientHeight;
      var menuTopValue = 66;
      $scope.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - menuTopValue;
    };

    $scope.$on('$stateChangeSuccess', function () {
      if (baSidebarService.canSidebarBeHidden()) {
        baSidebarService.setMenuCollapsed(true);
      }
    });
  }
})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  baSidebar.$inject = ["$timeout", "baSidebarService", "baUtil", "layoutSizes"];
  angular.module('BlurAdmin.theme.components')
      .directive('baSidebar', baSidebar);

  /** @ngInject */
  function baSidebar($timeout, baSidebarService, baUtil, layoutSizes) {
    var jqWindow = $(window);
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/baSidebar/ba-sidebar.html',
      controller: 'BaSidebarCtrl',
      link: function(scope, el) {

        scope.menuHeight = el[0].childNodes[0].clientHeight - 84;
        jqWindow.on('click', _onWindowClick);
        jqWindow.on('resize', _onWindowResize);

        scope.$on('$destroy', function() {
          jqWindow.off('click', _onWindowClick);
          jqWindow.off('resize', _onWindowResize);
        });

        function _onWindowClick($evt) {
          if (!baUtil.isDescendant(el[0], $evt.target) &&
              !$evt.originalEvent.$sidebarEventProcessed &&
              !baSidebarService.isMenuCollapsed() &&
              baSidebarService.canSidebarBeHidden()) {
            $evt.originalEvent.$sidebarEventProcessed = true;
            $timeout(function () {
              baSidebarService.setMenuCollapsed(true);
            }, 10);
          }
        }

        // watch window resize to change menu collapsed state if needed
        function _onWindowResize() {
          var newMenuCollapsed = baSidebarService.shouldMenuBeCollapsed();
          var newMenuHeight = _calculateMenuHeight();
          if (newMenuCollapsed != baSidebarService.isMenuCollapsed() || scope.menuHeight != newMenuHeight) {
            scope.$apply(function () {
              scope.menuHeight = newMenuHeight;
              baSidebarService.setMenuCollapsed(newMenuCollapsed)
            });
          }
        }

        function _calculateMenuHeight() {
          return el[0].childNodes[0].clientHeight - 84;
        }
      }
    };
  }

})();
(function() {
    'use strict';

    angular.module('BlurAdmin.theme.components')
        .provider('baSidebarService', baSidebarServiceProvider);

    /** @ngInject */
    function baSidebarServiceProvider() {
        var staticMenuItems = [];

        this.addStaticItem = function() {
            staticMenuItems.push.apply(staticMenuItems, arguments);
        };

        /** @ngInject */
        this.$get = ["$state", "layoutSizes", function($state, layoutSizes) {
            return new _factory();

            function _factory() {
                var isMenuCollapsed = shouldMenuBeCollapsed();

                this.getMenuItems = function() {
                    var states = defineMenuItemStates();
                    var menuItems = states.filter(function(item) {
                        return item.level == 0 && item.show == true;

                    });

                    menuItems.forEach(function(item) {
                        var children = states.filter(function(child) {
                            return child.level == 1 && child.name.indexOf(item.name) === 0;
                        });
                        item.subMenu = children.length ? children : null;
                    });

                    return menuItems.concat(staticMenuItems);
                };

                this.shouldMenuBeCollapsed = shouldMenuBeCollapsed;
                this.canSidebarBeHidden = canSidebarBeHidden;

                this.setMenuCollapsed = function(isCollapsed) {
                    isMenuCollapsed = isCollapsed;
                };

                this.isMenuCollapsed = function() {
                    return isMenuCollapsed;
                };

                this.toggleMenuCollapsed = function() {
                    isMenuCollapsed = !isMenuCollapsed;
                };

                this.getAllStateRefsRecursive = function(item) {
                    var result = [];
                    _iterateSubItems(item);
                    return result;

                    function _iterateSubItems(currentItem) {
                        currentItem.subMenu && currentItem.subMenu.forEach(function(subItem) {
                            subItem.stateRef && result.push(subItem.stateRef);
                            _iterateSubItems(subItem);
                        });
                    }
                };

                function defineMenuItemStates() {
                    return $state.get()
                        .filter(function(s) {
                            return s.sidebarMeta;
                        })
                        .map(function(s) {
                            var meta = s.sidebarMeta;
                            return {
                                name: s.name,
                                title: s.title,
                                level: (s.name.match(/\./g) || []).length,
                                order: meta.order,
                                icon: meta.icon,
                                stateRef: s.name,
                                show: meta.show
                            };
                        })
                        .sort(function(a, b) {
                            return (a.level - b.level) * 100 + a.order - b.order;
                        });
                }

                function shouldMenuBeCollapsed() {
                    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
                }

                function canSidebarBeHidden() {
                    return window.innerWidth <= layoutSizes.resWidthHideSidebar;
                }
            }

        }];
        this.$get.$inject = ["$state", "layoutSizes"];

    }
})();
/**
 * @author v.lugovsky
 * created on 03.05.2016
 */
(function () {
  'use strict';

  baSidebarToggleMenu.$inject = ["baSidebarService"];
  baSidebarCollapseMenu.$inject = ["baSidebarService"];
  BaSidebarTogglingItemCtrl.$inject = ["$scope", "$element", "$attrs", "$state", "baSidebarService"];
  baUiSrefTogglingSubmenu.$inject = ["$state"];
  baUiSrefToggler.$inject = ["baSidebarService"];
  angular.module('BlurAdmin.theme.components')
      .directive('baSidebarToggleMenu', baSidebarToggleMenu)
      .directive('baSidebarCollapseMenu', baSidebarCollapseMenu)
      .directive('baSidebarTogglingItem', baSidebarTogglingItem)
      .controller('BaSidebarTogglingItemCtrl', BaSidebarTogglingItemCtrl)
      .directive('baUiSrefTogglingSubmenu', baUiSrefTogglingSubmenu)
      .directive('baUiSrefToggler', baUiSrefToggler);

  /** @ngInject */
  function baSidebarToggleMenu(baSidebarService) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        elem.on('click', function($evt) {
          $evt.originalEvent.$sidebarEventProcessed = true;
          scope.$apply(function() {
            baSidebarService.toggleMenuCollapsed();
          });
        });
      }
    };
  }

  /** @ngInject */
  function baSidebarCollapseMenu(baSidebarService) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        elem.on('click', function($evt) {
          $evt.originalEvent.$sidebarEventProcessed = true;
          if (!baSidebarService.isMenuCollapsed()) {
            scope.$apply(function() {
              baSidebarService.setMenuCollapsed(true);
            });
          }
        });
      }
    };
  }

  /** @ngInject */
  function baSidebarTogglingItem() {
    return {
      restrict: 'A',
      controller: 'BaSidebarTogglingItemCtrl'
    };
  }

  /** @ngInject */
  function BaSidebarTogglingItemCtrl($scope, $element, $attrs, $state, baSidebarService) {
    var vm = this;
    var menuItem = vm.$$menuItem = $scope.$eval($attrs.baSidebarTogglingItem);
    if (menuItem && menuItem.subMenu && menuItem.subMenu.length) {
      vm.$$expandSubmenu = function() { console.warn('$$expandMenu should be overwritten by baUiSrefTogglingSubmenu') };
      vm.$$collapseSubmenu = function() { console.warn('$$collapseSubmenu should be overwritten by baUiSrefTogglingSubmenu') };

      var subItemsStateRefs = baSidebarService.getAllStateRefsRecursive(menuItem);

      vm.$expand = function() {
        vm.$$expandSubmenu();
        $element.addClass('ba-sidebar-item-expanded');
      };

      vm.$collapse = function() {
        vm.$$collapseSubmenu();
        $element.removeClass('ba-sidebar-item-expanded');
      };

      vm.$toggle = function() {
        $element.hasClass('ba-sidebar-item-expanded') ?
            vm.$collapse() :
            vm.$expand();
      };

      if (_isState($state.current)) {
        $element.addClass('ba-sidebar-item-expanded');
      }

      $scope.$on('$stateChangeStart', function (event, toState) {
        if (!_isState(toState) && $element.hasClass('ba-sidebar-item-expanded')) {
          vm.$collapse();
          $element.removeClass('ba-sidebar-item-expanded');
        }
      });

      $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (_isState(toState) && !$element.hasClass('ba-sidebar-item-expanded')) {
          vm.$expand();
          $element.addClass('ba-sidebar-item-expanded');
        }
      });
    }

    function _isState(state) {
      return state && subItemsStateRefs.some(function(subItemState) {
            return state.name.indexOf(subItemState) == 0;
          });
    }
  }

  /** @ngInject */
  function baUiSrefTogglingSubmenu($state) {
    return {
      restrict: 'A',
      require: '^baSidebarTogglingItem',
      link: function(scope, el, attrs, baSidebarTogglingItem) {
        baSidebarTogglingItem.$$expandSubmenu = function() { el.slideDown(); };
        baSidebarTogglingItem.$$collapseSubmenu = function() { el.slideUp(); };
      }
    };
  }

  /** @ngInject */
  function baUiSrefToggler(baSidebarService) {
    return {
      restrict: 'A',
      require: '^baSidebarTogglingItem',
      link: function(scope, el, attrs, baSidebarTogglingItem) {
        el.on('click', function() {
          if (baSidebarService.isMenuCollapsed()) {
            // If the whole sidebar is collapsed and this item has submenu. We need to open sidebar.
            // This should not affect mobiles, because on mobiles sidebar should be hidden at all
            scope.$apply(function() {
              baSidebarService.setMenuCollapsed(false);
            });
            baSidebarTogglingItem.$expand();
          } else {
            baSidebarTogglingItem.$toggle();
          }
        });
      }
    };
  }

})();

/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('backTop', backTop);

  /** @ngInject */
  function backTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/backTop/backTop.html',
      controller: function () {
        $('#backTop').backTop({
          'position': 200,
          'speed': 100
        });
      }
    };
  }

})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  contentTop.$inject = ["$location", "$state"];
  angular.module('BlurAdmin.theme.components')
      .directive('contentTop', contentTop);

  /** @ngInject */
  function contentTop($location, $state) {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/contentTop/contentTop.html',
      link: function($scope) {
        $scope.$watch(function () {
          $scope.activePageTitle = $state.current.title;
        });
      }
    };
  }

})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  MsgCenterCtrl.$inject = ["$scope", "$sce"];
  angular.module('BlurAdmin.theme.components')
      .controller('MsgCenterCtrl', MsgCenterCtrl);

  /** @ngInject */
  function MsgCenterCtrl($scope, $sce) {
    $scope.users = {
      0: {
        name: 'Vlad',
      },
      1: {
        name: 'Kostya',
      },
      2: {
        name: 'Andrey',
      },
      3: {
        name: 'Nasta',
      }
    };

    $scope.notifications = [
      {
        userId: 0,
        template: '&name posted a new article.',
        time: '1 min ago'
      },
      {
        userId: 1,
        template: '&name changed his contact information.',
        time: '2 hrs ago'
      },
      {
        image: 'assets/img/shopping-cart.svg',
        template: 'New orders received.',
        time: '5 hrs ago'
      },
      {
        userId: 2,
        template: '&name replied to your comment.',
        time: '1 day ago'
      },
      {
        userId: 3,
        template: 'Today is &name\'s birthday.',
        time: '2 days ago'
      },
      {
        image: 'assets/img/comments.svg',
        template: 'New comments on your post.',
        time: '3 days ago'
      },
      {
        userId: 1,
        template: '&name invited you to join the event.',
        time: '1 week ago'
      }
    ];

    $scope.messages = [
      {
        userId: 3,
        text: 'After you get up and running, you can place Font Awesome icons just about...',
        time: '1 min ago'
      },
      {
        userId: 0,
        text: 'You asked, Font Awesome delivers with 40 shiny new icons in version 4.2.',
        time: '2 hrs ago'
      },
      {
        userId: 1,
        text: 'Want to request new icons? Here\'s how. Need vectors or want to use on the...',
        time: '10 hrs ago'
      },
      {
        userId: 2,
        text: 'Explore your passions and discover new ones by getting involved. Stretch your...',
        time: '1 day ago'
      },
      {
        userId: 3,
        text: 'Get to know who we are - from the inside out. From our history and culture, to the...',
        time: '1 day ago'
      },
      {
        userId: 1,
        text: 'Need some support to reach your goals? Apply for scholarships across a variety of...',
        time: '2 days ago'
      },
      {
        userId: 0,
        text: 'Wrap the dropdown\'s trigger and the dropdown menu within .dropdown, or...',
        time: '1 week ago'
      }
    ];

    $scope.getMessage = function(msg) {
      var text = msg.template;
      if (msg.userId || msg.userId === 0) {
        text = text.replace('&name', '<strong>' + $scope.users[msg.userId].name + '</strong>');
      }
      return $sce.trustAsHtml(text);
    };
  }
})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('msgCenter', msgCenter);

  /** @ngInject */
  function msgCenter() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/msgCenter/msgCenter.html',
      controller: 'MsgCenterCtrl'
    };
  }

})();
/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html'
    };
  }

})();
/**
 * @author v.lugovsky
 * created on 17.12.2015
 */
(function () {
  'use strict';

  profilePicture.$inject = ["layoutPaths"];
  angular.module('BlurAdmin.theme')
      .filter('profilePicture', profilePicture);

  /** @ngInject */
  function profilePicture(layoutPaths) {
    return function(input, ext) {
      ext = ext || 'png';
      return layoutPaths.images.profile + input + '.' + ext;
    };
  }

})();

angular.module('BlurAdmin').run(['$templateCache', function($templateCache) {$templateCache.put('app/pages/blockPlanner/autoOptimalPlan.html','');
$templateCache.put('app/pages/blockPlanner/blockPlannerManager.html','<ul><li>\u65B9\u68481</li><li>\u65B9\u68482</li><li>\u65B9\u6848n</li><button>\u65B0\u5EFA\u7A7A\u65B9\u6848</button> <button>\u62F7\u8D1D\u6307\u5B9A\u65B9\u6848</button><li>\u67E5\u770B\u3001\u8BC4\u8BBA</li></ul>');
$templateCache.put('app/pages/blockPlanner/manualPlan.html','');
$templateCache.put('app/pages/blockPlanner/newBlockPlan.html','<h4>\u8BBE\u8BA1\u6761\u4EF6</h4><ul><li>\u89C4\u5212\u8BBE\u8BA1\u8981\u6C42</li><li>\u6210\u672C\u8BBE\u8BA1\u8981\u6C42</li><li>\u5176\u4ED6\u5404\u90E8\u95E8\u8981\u6C42</li><li>\u667A\u80FD\u6700\u4F18\u5316\u7EC4\u5408\u65B9\u6848</li><li>\u4EBA\u5DE5\u65B9\u6848</li><li>\u590D\u5236\u3001\u514B\u9686/\u65B9\u6848\u8FDB\u5316\u53F2</li><li>\u5EFA\u7B51DSL\u8BED\u8A00/\u5730\u5757\u5EFA\u7B51\u8BA1\u5BB9\u9762\u79EF=\u5730\u5757\u9762\u79EF*\u5BB9\u79EF\u7387 \u672F\u8BED\u3001\u516C\u5F0F\u7B49api</li></ul><h4></h4>');
$templateCache.put('app/pages/cost/costItemsShow.html','<div class="row"><div class="col-md-12"><div ba-panel ba-panel-title="\u6210\u672C\u5217\u8868" ba-panel-class="with-scroll"><uib-tabset><uib-tab heading="\u6210\u672C\u8BA1\u7B97\u8868"><!-- Nested node template --><script type="text/ng-template" id="nodes_renderer.html"><div ui-tree-handle class="tree-node tree-node-content">\n                            <a class="btn btn-success btn-xs" ng-if="node.childItems && node.childItems.length > 0" data-nodrag ng-click="toggle(this)"><span\n        class="glyphicon"\n        ng-class="{\n          \'glyphicon-chevron-right\': collapsed,\n          \'glyphicon-chevron-down\': !collapsed\n        }"></span></a> {{node.name}}\n                            <a class="pull-right btn btn-danger btn-xs" data-nodrag ng-click="remove(this)"><span\n        class="glyphicon glyphicon-remove"></span></a>\n                            <a class="pull-right btn btn-primary btn-xs" data-nodrag ng-click="newSubItem(this)" style="margin-right: 8px;"><span\n        class="glyphicon glyphicon-plus"></span></a>\n                        </div>\n                        <ol ui-tree-nodes="" ng-model="node.childItems" ng-class="{hidden: collapsed}">\n                            <li ng-repeat="node in node.childItems" ui-tree-node ng-include="\'nodes_renderer.html\'">\n                            </li>\n                        </ol></script><div class="row"><div class="col-sm-12"><h3>Basic Example</h3><button ng-click="expandAll()">Expand all</button> <button ng-click="collapseAll()">Collapse all</button></div></div><div class="row"><div class="col-sm-12"><div ui-tree id="tree-root" ng-controller="BasicExampleCtrl"><ol ui-tree-nodes ng-model="data"><li ng-repeat="node in data.costClass" ui-tree-node ng-include="\'nodes_renderer.html\'"></li></ol></div></div></div></uib-tab><uib-tab heading="\u6295\u8D44\u5468\u671F\u8868"><p>You can\'t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something--your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.</p><p>The reason most people never reach their goals is that they don\'t define them, or ever seriously consider them as believable or achievable. Winners can tell you where they are going, what they plan to do along the way, and who will be sharing the adventure with them.</p></uib-tab></uib-tabset></div></div></div>');
$templateCache.put('app/pages/cost/costRuleDetail.html','<div class="row"><div class="col-md-12"><div ba-panel ba-panel-title="\u6210\u672C\u5217\u8868" ba-panel-class="with-scroll"><div ng-include="\'app/pages/cost/widgets/costRuleEditable.html\'"></div></div></div></div>');
$templateCache.put('app/pages/cost/costRules.html','<div class="row"><div class="col-md-12"><div ba-panel ba-panel-title="\u6210\u672C\u5217\u8868" ba-panel-class="with-scroll"><div ng-include="\'app/pages/cost/widgets/costList.html\'"></div></div></div></div>');
$templateCache.put('app/pages/dashboard/dashboard.html','<div class="widget"><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u63CF\u8FF0" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/projectSummaryShow.html\'"></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.projectInfoEdit"><i class="ion-archive"></i>\u7F16\u8F91</button></li><li><button type="button" class="btn btn-default btn-with-icon"><i class="ion-folder"></i>\u8D44\u6599\u7BA1\u7406...</button></li></ul></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u5730\u5757\u51FA\u8BA9\u7EA6\u5B9A" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/landInfoShow.html\'"></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.landInfoEdit"><i class="ion-archive"></i>\u7F16\u8F91</button></li></ul></div></div></div><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9636\u6BB5\u76F8\u5173\u7684\u5DE5\u4F5C\u5206\u9875\u6807\u7B7E" ba-panel-class="with-scroll"><h3>\u6240\u6709\u529F\u80FD\u6682\u65F6\u6309spa\u505A\uFF0C\u6027\u80FD\u7B49\u4EE5\u540E\u518D\u8C03\u6574</h3><h3>\u6837\u5F0F\u9009\u7528\u591A\u6807\u7B7E\u6837\u5F0F</h3><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.projectInfoEdit"><i class="ion-archive"></i>\u7ECF\u6D4E\u6D4B\u7B97</button></li><li><button type="button" class="btn btn-default btn-with-icon"><i class="ion-folder"></i>\u672C\u9636\u6BB5\u8D44\u6599\u7BA1\u7406...</button></li></ul></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u4EBA\u4E8B\u7BA1\u7406\u3001\u7EC4\u7EC7\u67B6\u6784\u7BA1\u7406" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/landInfoShow.html\'"></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.landInfoEdit"><i class="ion-archive"></i>\u7F16\u8F91</button></li></ul></div></div></div><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u7BA1\u7406\u8FDB\u5EA6\u8BA1\u5212\u8868\u3001\u7518\u7279\u56FE\u3001shedule" ba-panel-class="with-scroll"><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.projectInfoEdit"><i class="ion-archive"></i>\u7ECF\u6D4E\u6D4B\u7B97</button></li><li><button type="button" class="btn btn-default btn-with-icon"><i class="ion-folder"></i>\u672C\u9636\u6BB5\u8D44\u6599\u7BA1\u7406...</button></li></ul></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u90E8\u95E8\u8BBE\u8BA1\u3001\u8D22\u52A1\u3001\u5DE5\u7A0B\u5206\u9875\u7BA1\u7406\u5DE5\u4F5C\u5206\u6D3E\u4E0E\u6C9F\u901A" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/landInfoShow.html\'"></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.landInfoEdit"><i class="ion-archive"></i>\u7F16\u8F91</button></li></ul></div></div></div><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u7BA1\u7406\u8FDB\u5EA6\u8BA1\u5212\u8868\u3001\u7518\u7279\u56FE\u3001shedule" ba-panel-class="with-scroll"><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.projectInfoEdit"><i class="ion-archive"></i>\u7ECF\u6D4E\u6D4B\u7B97</button></li><li><button type="button" class="btn btn-default btn-with-icon"><i class="ion-folder"></i>\u672C\u9636\u6BB5\u8D44\u6599\u7BA1\u7406...</button></li></ul></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u8FD0\u8425\u3001\u90E8\u95E8\u8BBE\u8BA1\u3001\u6210\u672C\u3001\u8D22\u52A1\u3001\u5DE5\u7A0B\u3001\u9500\u552E\u3001\u8FD0\u7EF4\u5206\u9875\u7BA1\u7406\u5DE5\u4F5C\u5206\u6D3E\u4E0E\u6C9F\u901A" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/landInfoShow.html\'"></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon" ui-sref="projectInfo.landInfoEdit"><i class="ion-archive"></i>\u7F16\u8F91</button></li></ul></div></div></div></div>');
$templateCache.put('app/pages/projectInfo/landAccordanceEditable.html','<div class="row"><div class="col-md-12"><div ba-panel ba-panel-title="\u571F\u5730\u51FA\u8BA9\u7EA6\u5B9A" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/landInfoEditable.html\'"></div></div></div></div>');
$templateCache.put('app/pages/projectInfo/projectInfoEditable.html','<div class="widget"><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u63CF\u8FF0" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/projectSummaryEditableform.html\'"></div></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u8D44\u6599\u7BA1\u7406" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/projectSummaryEditableform.html\'"></div></div></div></div></div>');
$templateCache.put('app/pages/projectInfo/projectInfoShow.html','<div class="widget"><div class="row"><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u63CF\u8FF0" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/projectSummaryEditableform.html\'"></div></div></div><div class="col-md-6"><div ba-panel ba-panel-title="\u9879\u76EE\u8D44\u6599\u7BA1\u7406" ba-panel-class="with-scroll"><div ng-include="\'app/pages/projectInfo/widgets/projectSummaryEditableform.html\'"></div></div></div></div></div>');
$templateCache.put('app/pages/cost/widgets/costList.html','<form ng-controller="costInfoCtl as costCtl"><div class="form-group form-inline"><div class="ng-cloak" ng-controller="landAccordanceOptionsCtl as optionsCtl"><div class="form-group col-md-5"><ui-select ng-model="landCtl.newRule.item" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u65B0\u589E\u7EA6\u5B9A\u6761\u76EE"><span>{{$select.selected.target}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.landAccordanceOptions | filter: $select.search" group-by="\'catagory\'"><span ng-bind-html="standardItem.target"></span></ui-select-choices></ui-select></div><div class="form-group col-md-1"><ui-select ng-model="landCtl.newRule.relation" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="=="><span>{{$select.selected}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.relationOptions | filter: $select.search"><span ng-bind-html="standardItem"></span></ui-select-choices></ui-select></div><div class="form-group col-md-3"><input type="text" class="form-control" id="input01" placeholder="\u8BF7\u8F93\u5165\u503C" ng-model="landCtl.newRule.value"></div><div class="form-group col-md-2"><ui-select ng-model="landCtl.newRule.unit" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u5355\u4F4D"><span>{{$select.selected.name}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.unitOptions | filter: $select.search" group-by="\'catagory\'"><span ng-bind-html="standardItem.name"></span></ui-select-choices></ui-select></div><button type="button" class="btn btn-default btn-with-icon" ng-click="landCtl.add()"><i class="ion-ios-plus-outline"></i>\u6DFB\u52A0</button></div></div><div class="form-group"><table ng-table-dynamic="landCtl.tableParams with landCtl.cols " class="table table-bordered table-condensed table-hover editable-table" ng-form="landCtl.tableForm"><colgroup><col width="20%" align="center"><col width="10%" align="center"><col width="20%" align="right"><col width="10%" align="center"><col width="40%" align="left"></colgroup><tr class="ng-table-group" ng-repeat-start="group in $groups"><td colspan="5"><a href="" ng-click="group.$hideRows = !group.$hideRows"><span class="glyphicon" ng-class="{ \'glyphicon-chevron-right\': group.$hideRows, \'glyphicon-chevron-down\': !group.$hideRows }"></span> <strong>{{group.value}}</strong></a></td></tr><tr ng-hide="group.$hideRows" ng-repeat="rule in group.data" ng-repeat-end><td ng-repeat="col in $columns"><span ng-if="col.dataType !==\'command\'">{{rule[col.field]}}</span> <button ng-if="col.dataType ===\'command\'" class="btn btn-danger btn-sm" ng-click="landCtl.del(rule)"><span class="glyphicon glyphicon-trash"></span></button></td></tr></table></div><ul class="btn-list clearfix"><li><button type="button " class="btn btn-default btn-with-icon"><i class="ion-archive"></i>\u4FDD\u5B58</button></li></ul></form>');
$templateCache.put('app/pages/cost/widgets/costRuleEditable.html','<div class="row"><div class="col-md-12"><div ba-panel ba-panel-title="\u7F16\u5199\u6210\u672C\u8BA1\u7B97\u89C4\u5219" ba-panel-class="with-scroll"></div></div></div>');
$templateCache.put('app/pages/projectInfo/widgets/landInfoEditable.html','<form ng-controller="landInfoCtl as landCtl"><div class="form-group form-inline"><div class="ng-cloak" ng-controller="landAccordanceOptionsCtl as optionsCtl"><div class="form-group col-md-5"><ui-select ng-model="landCtl.newRule.item" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u65B0\u589E\u7EA6\u5B9A\u6761\u76EE"><span>{{$select.selected.target}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.landAccordanceOptions | filter: $select.search" group-by="\'catagory\'"><span ng-bind-html="standardItem.target"></span></ui-select-choices></ui-select></div><div class="form-group col-md-1"><ui-select ng-model="landCtl.newRule.relation" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="=="><span>{{$select.selected}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.relationOptions | filter: $select.search"><span ng-bind-html="standardItem"></span></ui-select-choices></ui-select></div><div class="form-group col-md-3"><input type="text" class="form-control" id="input01" placeholder="\u8BF7\u8F93\u5165\u503C" ng-model="landCtl.newRule.value"></div><div class="form-group col-md-2"><ui-select ng-model="landCtl.newRule.unit" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u5355\u4F4D"><span>{{$select.selected.name}}</span></ui-select-match><ui-select-choices repeat="standardItem in optionsCtl.unitOptions | filter: $select.search" group-by="\'catagory\'"><span ng-bind-html="standardItem.name"></span></ui-select-choices></ui-select></div><button type="button" class="btn btn-default btn-with-icon" ng-click="landCtl.add()"><i class="ion-ios-plus-outline"></i>\u6DFB\u52A0</button></div></div><div class="form-group"><table ng-table-dynamic="landCtl.tableParams with landCtl.cols " class="table table-bordered table-condensed table-hover editable-table" ng-form="landCtl.tableForm"><colgroup><col width="20%" align="center"><col width="10%" align="center"><col width="20%" align="right"><col width="10%" align="center"><col width="40%" align="left"></colgroup><tr class="ng-table-group" ng-repeat-start="group in $groups"><td colspan="5"><a href="" ng-click="group.$hideRows = !group.$hideRows"><span class="glyphicon" ng-class="{ \'glyphicon-chevron-right\': group.$hideRows, \'glyphicon-chevron-down\': !group.$hideRows }"></span> <strong>{{group.value}}</strong></a></td></tr><tr ng-hide="group.$hideRows" ng-repeat="rule in group.data" ng-repeat-end><td ng-repeat="col in $columns"><span ng-if="col.dataType !==\'command\'">{{rule[col.field]}}</span> <button ng-if="col.dataType ===\'command\'" class="btn btn-danger btn-sm" ng-click="landCtl.del(rule)"><span class="glyphicon glyphicon-trash"></span></button></td></tr></table></div><ul class="btn-list clearfix"><li><button type="button " class="btn btn-default btn-with-icon"><i class="ion-archive"></i>\u4FDD\u5B58</button></li></ul></form>');
$templateCache.put('app/pages/projectInfo/widgets/landInfoShow.html','<form ng-controller="projectInfoCtl as infoCtl"><div class="form-group"><label for="project-name">\u9879\u76EE\u540D\u79F0</label><input type="text" class="form-control" id="project-name" placeholder="\u9879\u76EE\u540D\u79F0" ng-model="infoCtl.projectInfo.name"></div><div class="form-group"><label for="project-land-number">\u5730\u5757\u7F16\u53F7</label><input type="text" class="form-control" id="project-land-number" placeholder="\u591A\u5730\u5757\u4EE5\uFF0C\u5206\u9694" ng-model="infoCtl.projectInfo.number"></div><div class="form-group"><label for="project-name">\u9879\u76EE\u5730\u5740</label><div class="ng-cloak" ng-controller="SelectCityCtrl as selectpickerVm"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.location" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u7701\u5E02\u533A"><span>{{$select.selected.city}}</span></ui-select-match><ui-select-choices repeat="standardItem in selectpickerVm.cityOfProvince | filter: $select.search" group-by="\'province\'"><span ng-bind-html="standardItem.city"></span></ui-select-choices></ui-select></div></div></div><div class="form-group"><label for="project-name">\u9879\u76EE\u72B6\u6001</label><div class="ng-cloak" ng-controller="ProjectStatusCtl as statusVmCtl"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.status" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u76EE\u524D\u9879\u76EE\u8FDB\u5C55"><span>{{$select.selected.task}} : {{$select.selected.stage}}</span></ui-select-match><ui-select-choices repeat="standardItem in statusVmCtl.projectStatusList | filter: $select.search" group-by="\'stage\'"><span ng-bind-html="standardItem.task"></span></ui-select-choices></ui-select></div></div></div></form>');
$templateCache.put('app/pages/projectInfo/widgets/projectGovernmentCondition.html','<form><div class="form-group"><label for="input01">Text</label><input type="text" class="form-control" id="input01" placeholder="Text"></div><div class="form-group"><label for="input02">Password</label><input type="password" class="form-control" id="input02" placeholder="Password"></div><div class="form-group"><label for="input03">Rounded Corners</label><input type="text" class="form-control form-control-rounded" id="input03" placeholder="Rounded Corners"></div><div class="form-group"><label for="input04">With help</label><input type="text" class="form-control" id="input04" placeholder="With help"> <span class="help-block sub-little-text">A block of help text that breaks onto a new line and may extend beyond one line.</span></div><div class="form-group"><label for="input05">Disabled Input</label><input type="text" class="form-control" id="input05" placeholder="Disabled Input" disabled="disabled"></div><div class="form-group"><label for="textarea01">Textarea</label><textarea placeholder="Default Input" class="form-control" id="textarea01"></textarea></div><div class="form-group"><input type="text" class="form-control input-sm" id="input2" placeholder="Small Input"></div><div class="form-group"><input type="text" class="form-control input-lg" id="input4" placeholder="Large Input"></div></form>');
$templateCache.put('app/pages/projectInfo/widgets/projectSummaryEditableform.html','<form ng-controller="projectInfoCtl as infoCtl"><div class="form-group"><label for="project-name">\u9879\u76EE\u540D\u79F0</label><input type="text" class="form-control" id="project-name" placeholder="\u9879\u76EE\u540D\u79F0" ng-model="infoCtl.projectInfo.name"></div><div class="form-group"><label for="project-land-number">\u5730\u5757\u7F16\u53F7</label><input type="text" class="form-control" id="project-land-number" placeholder="\u591A\u5730\u5757\u4EE5\uFF0C\u5206\u9694" ng-model="infoCtl.projectInfo.number"></div><div class="form-group"><label for="project-name">\u9879\u76EE\u5730\u5740</label><div class="ng-cloak" ng-controller="SelectCityCtrl as selectpickerVm"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.location" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u7701\u5E02\u533A"><span>{{$select.selected.city}}</span></ui-select-match><ui-select-choices repeat="standardItem in selectpickerVm.cityOfProvince | filter: $select.search" group-by="\'province\'"><span ng-bind-html="standardItem.city"></span></ui-select-choices></ui-select></div></div></div><div class="form-group"><label for="project-name">\u9879\u76EE\u72B6\u6001</label><div class="ng-cloak" ng-controller="ProjectStatusCtl as statusVmCtl"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.status" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u76EE\u524D\u9879\u76EE\u8FDB\u5C55"><span>{{$select.selected.task}} : {{$select.selected.stage}}</span></ui-select-match><ui-select-choices repeat="standardItem in statusVmCtl.projectStatusList | filter: $select.search" group-by="\'stage\'"><span ng-bind-html="standardItem.task"></span></ui-select-choices></ui-select></div></div></div><ul class="btn-list clearfix"><li><button type="button" class="btn btn-default btn-with-icon"><i class="ion-archive"></i>\u4FDD\u5B58</button></li></ul></form>');
$templateCache.put('app/pages/projectInfo/widgets/projectSummaryShow.html','<form ng-controller="projectInfoCtl as infoCtl"><div class="form-group"><label for="project-name">\u9879\u76EE\u540D\u79F0</label><input type="text" class="form-control" id="project-name" placeholder="\u9879\u76EE\u540D\u79F0" ng-model="infoCtl.projectInfo.name"></div><div class="form-group"><label for="project-land-number">\u5730\u5757\u7F16\u53F7</label><input type="text" class="form-control" id="project-land-number" placeholder="\u591A\u5730\u5757\u4EE5\uFF0C\u5206\u9694" ng-model="infoCtl.projectInfo.number"></div><div class="form-group"><label for="project-name">\u9879\u76EE\u5730\u5740</label><div class="ng-cloak" ng-controller="SelectCityCtrl as selectpickerVm"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.location" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u7701\u5E02\u533A"><span>{{$select.selected.city}}</span></ui-select-match><ui-select-choices repeat="standardItem in selectpickerVm.cityOfProvince | filter: $select.search" group-by="\'province\'"><span ng-bind-html="standardItem.city"></span></ui-select-choices></ui-select></div></div></div><div class="form-group"><label for="project-name">\u9879\u76EE\u72B6\u6001</label><div class="ng-cloak" ng-controller="ProjectStatusCtl as statusVmCtl"><div class="form-group"><ui-select ng-model="infoCtl.projectInfo.status" class="btn-group bootstrap-select form-control" ng-disabled="false" append-to-body="true" search-enabled="true"><ui-select-match placeholder="\u76EE\u524D\u9879\u76EE\u8FDB\u5C55"><span>{{$select.selected.task}} : {{$select.selected.stage}}</span></ui-select-match><ui-select-choices repeat="standardItem in statusVmCtl.projectStatusList | filter: $select.search" group-by="\'stage\'"><span ng-bind-html="standardItem.task"></span></ui-select-choices></ui-select></div></div></div></form>');
$templateCache.put('app/theme/components/baSidebar/ba-sidebar.html','<aside class="al-sidebar" ng-swipe-right="$baSidebarService.setMenuCollapsed(false)" ng-swipe-left="$baSidebarService.setMenuCollapsed(true)" ng-mouseleave="hoverElemTop=selectElemTop"><ul class="al-sidebar-list" slimscroll="{height: \'{{menuHeight}}px\'}" slimscroll-watch="menuHeight"><li ng-repeat="item in ::menuItems" class="al-sidebar-list-item" ng-class="::{\'with-sub-menu\': item.subMenu}" ui-sref-active="selected" ba-sidebar-toggling-item="item"><a ng-mouseenter="hoverItem($event, item)" ui-state="item.stateRef || \'\'" ng-href="{{::(item.fixedHref ? item.fixedHref: \'\')}}" ng-if="::!item.subMenu" class="al-sidebar-list-link"><i class="{{ ::item.icon }}"></i><span>{{ ::item.title }}</span> </a><a ng-mouseenter="hoverItem($event, item)" ng-if="::item.subMenu" class="al-sidebar-list-link" ba-ui-sref-toggler><i class="{{ ::item.icon }}"></i><span>{{ ::item.title }}</span> <b class="fa fa-angle-down" ui-sref-active="fa-angle-up" ng-if="::item.subMenu"></b></a><ul ng-if="::item.subMenu" class="al-sidebar-sublist" ng-class="{\'slide-right\': item.slideRight}" ba-ui-sref-toggling-submenu><li ng-repeat="subitem in ::item.subMenu" ng-class="::{\'with-sub-menu\': subitem.subMenu}" ui-sref-active="selected" ba-sidebar-toggling-item="subitem" class="ba-sidebar-sublist-item"><a ng-mouseenter="hoverItem($event, item)" ng-if="::subitem.subMenu" ba-ui-sref-toggler class="al-sidebar-list-link subitem-submenu-link"><span>{{ ::subitem.title }}</span> <b class="fa" ng-class="{\'fa-angle-up\': subitem.expanded, \'fa-angle-down\': !subitem.expanded}" ng-if="::subitem.subMenu"></b></a><ul ng-if="::subitem.subMenu" class="al-sidebar-sublist subitem-submenu-list" ng-class="{expanded: subitem.expanded, \'slide-right\': subitem.slideRight}" ba-ui-sref-toggling-submenu><li ng-mouseenter="hoverItem($event, item)" ng-repeat="subSubitem in ::subitem.subMenu" ui-sref-active="selected"><a ng-mouseenter="hoverItem($event, item)" href ng-if="::subSubitem.disabled" class="al-sidebar-list-link">{{ ::subSubitem.title }} </a><a ng-mouseenter="hoverItem($event, item)" ui-state="subSubitem.stateRef || \'\'" ng-if="::!subSubitem.disabled" ng-href="{{::(subSubitem.fixedHref ? subSubitem.fixedHref: \'\')}}">{{::subSubitem.title }}</a></li></ul><a ng-mouseenter="hoverItem($event, item)" href ng-if="::(!subitem.subMenu && subitem.disabled)" class="al-sidebar-list-link">{{ ::subitem.title }} </a><a ng-mouseenter="hoverItem($event, item)" target="{{::(subitem.blank ? \'_blank\' : \'_self\')}}" ng-if="::(!subitem.subMenu && !subitem.disabled)" ui-state="subitem.stateRef || \'\'" ng-href="{{::(subitem.fixedHref ? subitem.fixedHref: \'\')}}">{{ ::subitem.title}}</a></li></ul></li></ul><div class="sidebar-hover-elem" ng-style="{top: hoverElemTop + \'px\', height: hoverElemHeight + \'px\'}" ng-class="{\'show-hover-elem\': showHoverElem }"></div></aside>');
$templateCache.put('app/theme/components/backTop/backTop.html','<i class="fa fa-angle-up back-top" id="backTop" title="Back to Top"></i>');
$templateCache.put('app/theme/components/contentTop/contentTop.html','<div class="content-top clearfix"><h1 class="al-title">{{ activePageTitle }}</h1><ul class="breadcrumb al-breadcrumb"><li><a href="#/dashboard">Home</a></li><li>{{ activePageTitle }}</li></ul></div>');
$templateCache.put('app/theme/components/msgCenter/msgCenter.html','<ul class="al-msg-center clearfix"><li uib-dropdown><a href uib-dropdown-toggle><i class="fa fa-bell-o"></i><span>5</span><div class="notification-ring"></div></a><div uib-dropdown-menu class="top-dropdown-menu"><i class="dropdown-arr"></i><div class="header clearfix"><strong>Notifications</strong> <a href>Mark All as Read</a> <a href>Settings</a></div><div class="msg-list"><a href class="clearfix" ng-repeat="msg in notifications"><div class="img-area"><img ng-class="{\'photo-msg-item\' : !msg.image}" ng-src="{{::( msg.image ||  (users[msg.userId].name | profilePicture) )}}"></div><div class="msg-area"><div ng-bind-html="getMessage(msg)"></div><span>{{ msg.time }}</span></div></a></div><a href>See all notifications</a></div></li><li uib-dropdown><a href class="msg" uib-dropdown-toggle><i class="fa fa-envelope-o"></i><span>5</span><div class="notification-ring"></div></a><div uib-dropdown-menu class="top-dropdown-menu"><i class="dropdown-arr"></i><div class="header clearfix"><strong>Messages</strong> <a href>Mark All as Read</a> <a href>Settings</a></div><div class="msg-list"><a href class="clearfix" ng-repeat="msg in messages"><div class="img-area"><img class="photo-msg-item" ng-src="{{::( users[msg.userId].name | profilePicture )}}"></div><div class="msg-area"><div>{{ msg.text }}</div><span>{{ msg.time }}</span></div></a></div><a href>See all messages</a></div></li></ul>');
$templateCache.put('app/theme/components/pageTop/pageTop.html','<div class="page-top clearfix" scroll-position="scrolled" max-height="50" ng-class="{\'scrolled\': scrolled}"><a href="#/dashboard" class="al-logo clearfix"><span>GC </span>Architecture</a> <a href class="collapse-menu-link ion-navicon" ba-sidebar-toggle-menu></a><div class="search"><i class="ion-ios-search-strong" ng-click="startSearch()"></i> <input id="searchInput" type="text" placeholder="Search for..."></div><div class="user-profile clearfix"><div class="al-user-profile" uib-dropdown><a uib-dropdown-toggle class="profile-toggle-link"><img ng-src="{{::( \'Nasta\' | profilePicture )}}"></a><ul class="top-dropdown-menu profile-dropdown" uib-dropdown-menu><li><i class="dropdown-arr"></i></li><li><a href="#/profile"><i class="fa fa-user"></i>Profile</a></li><li><a href><i class="fa fa-cog"></i>Settings</a></li><li><a href class="signout"><i class="fa fa-power-off"></i>Sign out</a></li></ul></div><msg-center></msg-center></div></div>');}]);