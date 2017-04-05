/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
    'use strict';

    angular.module('BlurAdmin.pages.cost')
        .service('costInfo', costInfo);
    var planCostClassCache = {};
    var cached = false;
    var costInfoUrl = "/cost/info";

    /** @ngInject */
    function costInfo($q, $http, $timeout) {
        this.loadCostClass = function(cb) {
            if (cached) {
                if (cb) {
                    $timeout(function() {
                        return cb(null, planCostClassCache);
                    }, 0);

                }

            } else {

                $http({ method: "GET", url: costInfoUrl }).then(
                    function(response) {
                        planCostClassCache = response.data;
                        if (cb) {
                            return cb(null, planCostClassCache);
                        }
                    },
                    function(response) {
                        if (cb) {
                            var status = { error: response.status, cause: response.toString() };
                            return cb(status, null);
                        }

                    });



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