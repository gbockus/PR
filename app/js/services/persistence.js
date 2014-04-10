'use strict';

/**
 * A module used to provide persistence related services.
 */
angular.module('services.persistence', [])
  .constant('TYPES', {
    AUTH: 'auth',
    PR: 'pr',
    COMMIT: 'commit',
    STATS: 'stats'
  })
  /**
   * A service used to interactive with the persistence layer.
   */
  .factory('persistenceUtils', function(TYPES) {

    var Datastore = require('nedb');
    var path = require('path');
    var Q = require('q');
    var db;

      db = new Datastore({
        filename: path.join(process.cwd(), 'pr.db'),
        autoload: true
      });

    return {
      /**
       * Get the user infomation.
       *
       * @returns {Q.promise} - A promise that resolves into the user object is any has been saved, otherwise an empty object.
       */
      getUserInfo: function() {
        var deferred = Q.defer();
        db.find({type: TYPES.AUTH}, function(err, authInfo) {
          if (authInfo.length > 0) {
            deferred.resolve(authInfo[0]);
          } else {
            deferred.resolve({});
          }
        });

        return deferred.promise;
      },

      /**
       * Save the user information object.
       *
       * @param {Object} userInfo - An object containing user information.
       * @returns {Q.promise} A promise that resolves to the number of updated records.
       */
      setUserInfo: function(userInfo) {
        var deferred = Q.defer();
        userInfo.type = userInfo.type || TYPES.AUTH;
        db.update({type: TYPES.AUTH}, userInfo, {upsert: true}, function(err, numUpdated) {
          console.log('numUpdated: '+ numUpdated);
          deferred.resolve(numUpdated);
        });

        return deferred.promise;
      },

      /**
       * Get the persisted pull request data.
       *
       * @param {String} repo - The github repository associated with the PR's.
       * @returns {Q.promise} - A promise that resolves to the persisted PR's.
       */
      getPRs: function(repo) {
        var deferred = Q.defer();
        db.find({type: TYPES.PR, repo: repo}, function(err, prs) {
          if (prs.length > 0) {
            deferred.resolve(prs[0]);
          } else {
            deferred.resolve({});
          }
        });

        return deferred.promise;
      },

      /**
       * Saves a PR object.
       *
       * @param {String} repo - The repository associated with PR's.
       * @param {Object} prs - A pull request object.
       * @returns {Q.promise} - A promise that resolves into the number of updated records.
       */
      setPRs: function(repo, prs) {
        var prsObj = {
          type: TYPES.PR,
          repo: repo,
          prs: prs
          },
          deferred = Q.defer();
        db.update({type: TYPES.PR, repo: repo}, prsObj, {upsert: true}, function(err, numUpdated) {
          console.log('setPRS numUpdated: '+ numUpdated);
          deferred.resolve(numUpdated);
        });

        return deferred.promise;
      },

      /**
       * Get the stats object associated with a pull requests.
       *
       * @returns {Q.promise} - A promise that resolves into the stats object, or an empty object if none was found.
       */
      getStats: function() {
        var deferred = Q.defer();
        db.find({type: TYPES.STATS}, function(err, stats) {
          if (stats.length > 0) {
            deferred.resolve(stats[0]);
          } else {
            deferred.resolve({});
          }
        });

        return deferred.promise;
      },

      /**
       * Saves a stats object.
       *
       * @param {Object} stats - A stats object.
       * @returns {Q.promise} - A promise that resolves into the number of updated records.
       */
      setStats: function(stats) {
        var statsObj = {
            type: TYPES.STATS,
            stats: stats
          },
          deferred = Q.defer();
        db.update({type: TYPES.STATS}, statsObj, {upsert: true}, function(err, numUpdated) {
          console.log('setStats numUpdated: '+ numUpdated);
          deferred.resolve(numUpdated);
        });

        return deferred.promise;
      }


    };

  });