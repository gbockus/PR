'use strict';

/**
 * A module to provide services related to user notifications.
 */
angular.module('services.notifier', [])
  /**
   * A service that will send system notifications.
   */
  .factory('notifier', function() {

    var Notification = require('node-notifier');

    var notifier = new Notification();

    return {
      /**
       * Send a system notification.
       *
       * @param {String} msg - The message to be displayed.
       * @param {String} title The title of the system notification.
       */
      sendNotification: function(msg, title) {
        var msgObj = {
          message: msg
        };

        if (title) {
          msgObj.title = title
        }

        notifier.notify(msgObj);
      }
    };

  });