'use strict';

angular.module('services.current', [])
  .factory('currentUtils', function() {

    return {
      current: undefined,

      setCurrent: function(newData) {
        this.current = newData;
      }

    };

  });