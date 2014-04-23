'use strict';


angular.module('pulls', [

  ])
// This defines the main abstract main view that is shared across all
  // subviews.
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('pulls', {
        url: '/pulls',
        views: {
          content: {
            templateUrl: 'pulls.tpl.html',
            controller: 'PullsCtrl'
          }
        }
      });
  }])
  .controller('PullsCtrl', ['$scope', '$state', 'githubUtils', 'currentUtils', 'persistenceUtils', '$timeout', 'statsSvc', function($scope, $state, githubUtils, currentUtils, persistenceUtils, $timeout, statsSvc) {
    var s = $scope,
      Q = require('q');

    $scope.prOrder = 'updated_at';
    $scope.repoPRs = {};
    $scope.refreshPromise = undefined;
    $scope.hideState = {};

    $scope.goToPR = function(pr) {
      currentUtils.setCurrent(pr);
      $state.go('pr');
    };

    $scope.goToAccount = function() {
      $state.go('account');
    };

    $scope.getPRs = function(refresh) {
      persistenceUtils.getUserInfo()
        .then(function(userInfo) {
          var promiseArray = [];
          if (!userInfo.repos) {
            $state.go('account');
          }
          userInfo.repos.forEach(function(repo) {
            promiseArray.push(githubUtils.getPRs(repo, refresh)
              .then(function(prs) {
                $scope.repoPRs[repo] = prs;
              }));
          });
          Q.allSettled(promiseArray)
            .then(function() {
              statsSvc.updateStats($scope.repoPRs);
              s.$apply();
            });
        });
    };

    $scope.getPRs(false);

    function refreshPRs() {
      console.log('Enter Refresh PRs');
      $scope.getPRs(true);
      $scope.refreshPromise = $timeout(refreshPRs, $scope.frequency);
    }

    if (!$scope.refreshPromise) {
      persistenceUtils.getUserInfo()
        .then(function(userInfo) {
          if (userInfo.frequency) {
            if ($scope.refreshPromise) {
              // Cancel any other interval already going.
              $timeout.cancel($scope.refreshPromise);
            }
            $scope.frequency = parseInt(userInfo.frequency, 10) * 1000 || 60000;
            $scope.refreshPromise = $timeout(refreshPRs, $scope.frequency);
          }
        });
    }

    $scope.$on('$destroy', function() {
      //TODO: this should go in a service so that it's not tied to a particular UI.
      // stop the timeout
      $timeout.cancel($scope.refreshPromise);
    });


  }]);


