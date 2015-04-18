var request = Npm.require('superagent');
var Promise = Npm.require('bluebird');
var groupBy = Npm.require('lodash.groupby');

var clientId     = Meteor.settings.private.clientId;
var clientSecret = Meteor.settings.private.clientSecret;
var AUTH = '?client_id='     + clientId     +
           '&client_secret=' + clientSecret;

var GITHUB_URL = 'https://api.github.com/';
var DATE = '3-25-2015';

Meteor.methods({
  fetchRepos: function () {
    var deferred = Promise.defer();
    var url = GITHUB_URL + 'users/bricejlin' + '/repos' + AUTH;
    request
      .get(url)
      .end(function (err, res) {
        if (err) deferred.reject(res.text);
        deferred.resolve(res.body);
      });
    return deferred.promise;
  },

  getRepoNames: function (repos) {
    return repos.map(function (repo) {
      return repo.name;
    });
  },

  fetchStatsFromEachCommit: function (commits) {
    var promises = commits.map(function (commit) {
      return fetchCommitStats(commit.url)
        .then(function (res) {
          return {
            name: res.commit.author.name,
            stats: res.stats
          }
        });
    });
    return Promise.all(promises);
  },

  fetchCommitStats: function (url) {
    var deferred = Promise.defer();
    request
      .get(url + AUTH)
      .end(function (err, res) {
        if (err) deferred.reject(res.text);
        deferred.resolve(res.body);
      });
    return deferred.promise;
  },

  filterByDate: function (commits) {
    var date = new Date(DATE);
    return commits.filter(function (commit) {
      var commitDate = new Date(commit.commit.author.date);
      return getUTCDateString(commitDate) >= getUTCDateString(date);
    });
  },

  getUTCDateString: function (date) {
    return date.getUTCFullYear() + '-' + date.getUTCDate() + '-' + date.getUTCMonth();
  },

  groupByName: function (commits) {
    var people = [];
    var namesObj = groupBy(commits, function (commit) {
      return commit.name;
    });

    for (var name in namesObj) {
      people.push({
        name: name,
        deletions: reduceDeletions(namesObj[name])
      });
    }

    return people;
  },

  reduceDeletions: function (stats) {
    return stats.reduce(function (p, c) {
      return p + c.stats.deletions - c.stats.additions;
    }, 0);
  }
});