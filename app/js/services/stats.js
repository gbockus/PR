'use strict';

/**
 * A module to hold services related to PR statistics.
 */
angular.module('services.stats', [])
  /**
   * A service for keeping track of statistics around pull requests for a repository.
   */
  .factory('statsSvc', function(persistenceUtils, notifier) {
    return {
      /**
       * Update the stats for a repo based on the pr object.
       *
       * @param {Object} repoPrs - A PR object associated with repositories.
       */
      updateStats: function(repoPrs) {
        var currentStats = {},
          repos = _.keys(repoPrs);

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