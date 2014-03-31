'use strict';

angular.module('services.persistence', [])
  .constant('TYPES', {
    AUTH: 'auth',
    PR: 'pr',
    COMMIT: 'commit',
    STATS: 'stats'
  })
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

      setUserInfo: function(userInfo) {
        var deferred = Q.defer();
        userInfo.type = userInfo.type || TYPES.AUTH;
        db.update({type: TYPES.AUTH}, userInfo, {upsert: true}, function(err, numUpdated) {
          console.log('numUpdated: '+ numUpdated);
          deferred.resolve(numUpdated);
        });

        return deferred.promise;
      },

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

      getStats: function(repo) {
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