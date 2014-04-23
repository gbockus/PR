'use strict';

angular.module('services.external', [])
/**
 * Service used to provide functions to interact with the external system.
 */
  .factory('externalUtils', function() {
    var gui = require('nw.gui');

    return {
      openInBrowser: function(url) {
        // Load native UI library.

        gui.Shell.openExternal(url);
      }

    };

  });