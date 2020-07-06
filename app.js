angular.module('demoApp', [])
    .controller('demoCtrl', function ($scope, $compile, $window) {
        var todoList = this;
        todoList.todos = [
            {id: 1, text:'learn AngularJS', done:true},
            {id: 2, text:'build an AngularJS app', done:false}];

        $scope.handler = function(e) {
            // TODO bind
        };

        $scope.selection = [1, 3];
        $scope.isInSelection = function(id) {
            const isMatch = ~$scope.selection.indexOf(Number(id));
            return isMatch;
        }

        const list = angular.element( document.querySelector( '#list' ) );

        list.append(
            $compile('<li><button id="3" ng-click="handler()" data-done="false" data-ng-class="isInSelection(3) ? \'selected\' : \'\'">New entry</button></li>')($scope)
        );
    })
    // .directive('mention', function() {
    //     return {
    //         restrict: 'AEC',
    //         transclude: true,
    //         link: function (scope, element, attr) {
    //         },
    //         template: '<tag></tag>'
    //     }
    // })
;