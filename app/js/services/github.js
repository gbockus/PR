'use strict';

angular.module('services.github', [])
  .factory('githubUtils', function(persistenceUtils, $state) {

    var GitHubApi = require("node-github"),
      Q = require('q'),
      userInfo;


    function getConfigInfo() {
      var deferred = Q.defer();
      return persistenceUtils.getUserInfo()
        .then(function(configInfo) {
          if (!configInfo.orgname || !configInfo.token) {
            $state.go('account');
          } else {
            userInfo = configInfo;
            return configInfo;
          }

        });

      return deferred.promise;
    }


    function getGithub() {
      return getConfigInfo()
        .then(function(userInfo) {

          var github = new GitHubApi({
            // required
            version: "3.0.0",
            // optional
            timeout: 5000
          }), githubQ;

          github.authenticate({
            type: "oauth",
            token: userInfo.token
          });

          githubQ = {
            getOrg: Q.nbind(github.orgs.get),
            getPRs: Q.nbind(github.pullRequests.getAll),
            getPRComments: Q.nbind(github.pullRequests.getComments),
            getPRCommits: Q.nbind(github.pullRequests.getCommits),
            getCommitComments: Q.nbind(github.repos.getCommitComments)
          };
          return githubQ;
        });

    }

    return {
      org: undefined,

      getOrg: function() {
        var me = this,
          configPromise;

        if (this.org) {
          return new Q(this.org);
        }

        return getGithub()
          .then(function(gq) {
            return gq.getOrg({
              org: userInfo.orgname
            })
              .then(function(org) {
                me.org = org;
                return org;
              });
          })
          .fail(function(err) {
            console.log("GETOrg fail: "+err.message);
          });

      },

      getPRs: function(repo, refresh) {
        var me = this;
        if (!refresh) {
          return persistenceUtils.getPRs(repo)
            .then(function(prs) {
              if (!prs.type) {
                return me.refreshPRs(repo);
              }
              return prs.prs;
            })
        } else {
          return this.refreshPRs(repo);
        }
      },

      refreshPRs: function(repo) {
        var me = this;

        return this.getOrg()
          .then(function(org) {
            return Q.all([getGithub().then(function(gq) {
              return gq.getPRs({
                user: org.login,
                repo: repo,
                state: 'open'
              })
            }), org]);
          })
          .spread(function(prs, org) {
            var commitPromises = [];
            prs.forEach(function(pr) {
              commitPromises.push(getGithub()
                .then(function(gq) {
                  return gq.getPRCommits({
                    user: org.login,
                    repo: repo,
                    number: pr.number
                  });
                })
                .then(function(commits) {
                  var commitCommentPromises = [];
                  pr.commitCommentCount = 0;

                  commits.forEach(function(commit) {
                    commitCommentPromises.push(getGithub()
                      .then(function(gq) {
                        return gq.getCommitComments({
                          user: org.login,
                          repo: repo,
                          sha: commit.sha
                        })
                          .then(function(comments) {
                            console.log(comments);
                            commit.comments = comments;
                            pr.commitCommentCount += comments.length;
                          });
                      }));
                  });
                  return Q.allSettled(commitCommentPromises)
                    .then(function() {
                      pr.commits = commits;
                    });
                }));
            });
            return Q.allSettled(commitPromises)
              .spread(function() {
                return persistenceUtils.setPRs(repo, prs)
                  .then(function() {
                    console.log('done saving prs');
                    return prs;
                  });
              });

          });
      }

    };

  });