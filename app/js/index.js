'use strict';

angular.module('PR', [
    'ui.router',
    'account',
    'pulls',
    'pr',
    'services'
  ])
  .run(['$rootScope', '$state',
    function($rootScope, $state) {
      $state.go('pulls');
    }]);
