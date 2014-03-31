'use strict';


angular.module('account', [

])
// This defines the main abstract main view that is shared across all
  // subviews.
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('account', {
        url: '/account',
        views: {
          content: {
            templateUrl: 'account.tpl.html',
            controller: 'AccountCtrl'
          }
        }
      });
  }])
  .controller('AccountCtrl', ['$scope', '$state', 'persistenceUtils', function($scope, $state, persistenceUtils) {
    var s = $scope,
      Q = require('q');

    persistenceUtils.getUserInfo()
      .then(function(result) {
        $scope.user = result;
        $scope.$apply();
      });

    $scope.update = function(user) {
      persistenceUtils.setUserInfo(user);
      $scope.goToPulls();
    };

    $scope.removeRepo = function(repo) {
      if(angular.isArray($scope.user.repos)) {
        $scope.user.repos = _.without($scope.user.repos, repo);
      }
    }

    $scope.goToPulls = function() {
      $state.go('pulls');
    }

    $scope.addRepo = function(){
      if($scope.currentRepo) {
        $scope.user.repos = $scope.user.repos || [];
        $scope.user.repos.push($scope.currentRepo);
        $scope.currentRepo = undefined;
      }
    }

  }]);


