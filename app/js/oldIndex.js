
var GitHubApi = require("node-github"),
  Q = require('q');

var github = new GitHubApi({
  // required
  version: "3.0.0",
  // optional
  timeout: 5000
});
github.authenticate({
  type: "basic",
  username: 'gbockus',
  password: 'g0sooners'
});

var findMembers = Q.nbind(github.orgs.getMembers),
  getIssues = Q.nbind(github.issues.getAll),
  getOrg = Q.nbind(github.orgs.get),
  getPRs = Q.nbind(github.pullRequests.getAll),
  getPRComments = Q.nbind(github.pullRequests.getComments);

Q.all([
    getPRs({
      user: 'SpanningCloudApps',
      repo: 'burn'
    }),
    getPRs({
      user: 'SpanningCloudApps',
      repo: 'scar'
    })])
  .spread(function(burnPRs, scarPRs) {
    console.log(burnPRs);
  })
  .fail(function(err) {
    console.log(err.message);
  });