'use strict';

angular.module('services.github', [])
  /**
   * Service used for interacting with github.
   */
  .factory('githubUtils', function(persistenceUtils, $state) {

    var GitHubApi = require("node-github"),
      Q = require('q'),
      userInfo;

    /**
     * Get the user infomation.
     *
     * @returns {Q} - A promise that resolves into the current user info including the
     * github organization and token.  If the orgname or token is not set then the UI
     * will be redirected to the account page.
     */
    function getConfigInfo() {
      return persistenceUtils.getUserInfo()
        .then(function(configInfo) {
          if (!configInfo.orgname || !configInfo.token) {
            $state.go('account');
          } else {
            userInfo = configInfo;
            return configInfo;
          }
        });
    }

    /**
     * Get a githubQ object for making q promise enabled calls.
     *
     * @returns {githubQ} - A object with methods that can be used to make calls to github
     * services that have been wrapped by the q promise library.  Note there are only a limited
     * number of services currently available.  See the function for available services.
     */
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

      /**
       * Get the organization.
       *
       * @returns {Q.promise} A promise that resolves into the Org object returned from github.
       */
      getOrg: function() {
        var me = this;

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

      /**
       * Get Pull requests associated with the current organization.
       *
       * @param {String} repo - The github repository.
       * @param {Boolean} refresh - True to force a refresh of the PR data, false or unset and it will either go to github if
       *  no cached copy exists or return the cached copy.
       * @returns {Array} An array of pull request objects.
       */
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

      /**
       * Refresh the pr array for a repository.
       *
       * @private
       * @param {String} repo - The github repository.
       * @returns {Array} - The refreshed array of pull request object.
       */
      refreshPRs: function(repo) {

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