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
  .controller('PRCtrl', ['$scope', '$state', 'currentUtils', 'externalUtils', function($scope, $state, currentUtils, externalUtils) {
    $scope.pr = currentUtils.current;
    $scope.hideComments = {};

    $scope.goToPulls = function() {
      $state.go('pulls')
    };

    $scope.openCommit = function(url) {
      externalUtils.openInBrowser(url);
    };
  }]);


