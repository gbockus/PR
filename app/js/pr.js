'use strict';


angular.module('pr', [

  ])
// This defines the main abstract main view that is shared across all
  // subviews.
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('pr', {
        url: '/prs',
        views: {
          content: {
            templateUrl: 'pr.tpl.html',
            controller: 'PRCtrl'
          }
        }
      });
  }])
  .controller('PRCtrl', ['$scope', '$state', 'currentUtils', function($scope, $state, currentUtils) {
    $scope.pr = currentUtils.current;

    $scope.goToPulls = function() {
      $state.go('pulls')
    }
  }]);


