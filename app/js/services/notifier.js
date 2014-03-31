'use strict';

angular.module('services.notifier', [])
  .factory('notifier', function() {

    var Notification = require('node-notifier');

    var notifier = new Notification();

    return {
      sendNotification: function(msg, title) {
        var msgObj = {
          message: msg
        };

        if(title) {
          msgObj.title = title
        };

        notifier.notify(msgObj);
      }
    };

  });