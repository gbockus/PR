'use strict';

angular.module('services.stats', [])
  .factory('statsSvc', function(persistenceUtils, notifier) {
    return {
      updateStats: function(repoPrs) {
        var currentStats = {},
          repos = _.keys(repoPrs),
          newStats = {};

        if (repos.length === 0)
        {
          return;
        }

        repos.forEach(function(repo) {
          var statsObj = {};
          statsObj.numPRs = repoPrs[repo].length;

          currentStats[repo] = statsObj;
        }, this);

        persistenceUtils.getStats()
          .then(function(statsObj) {
            var stats = statsObj.stats;
            console.log('loaded old stats');
            repos.forEach(function(repo) {
              if (currentStats[repo] && stats[repo]) {
                var diff = currentStats[repo].numPRs - stats[repo].numPRs;
                if (diff > 0) {
                  console.log('new PR detected');
                  notifier.sendNotification("New Pull Request detected for " + repo, "PR Notification");
                }
              }
            }, this);
            persistenceUtils.setStats(currentStats)
              .then(function() {
                console.log('saved stats');
              });
          })

      }

    };

  });