'use strict';

angular.module('services.current', [])
  /**
   * Service used to keep the state of the current data.
   */
  .factory('currentUtils', function() {

    return {
      current: undefined,

      setCurrent: function(newData) {
        this.current = newData;
      }

    };

  });