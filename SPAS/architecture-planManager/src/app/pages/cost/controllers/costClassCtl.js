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

            costInfo.loadCostClass(function(err, classInfo) {
                if (err) {
                    alert(err.cause);
                } else {
                    $scope.data = classInfo;
                }



            });

        }]);

}());