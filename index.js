var bodyParser = require('body-parser');
var express = require('express');
var git = require('nodegit');
var lock = require('lock');
var morgan = require('morgan');
var path = require('path');

var Repository = git.Repository;
var repoPath = path.resolve('../api');

Repository.open(repoPath)
  .then(function(repository) {
    var app = express();

    app.use(morgan('dev'));
    app.use(bodyParser.json());

    app.post('/pr-closed', function(req, res, next) {
      lock('repo', function(releaseLock) {
        repository.checkoutBranch('master')
          .then(function() {
            return repository.fetch('origin');
          })
          .then(function() {
            return repository.mergeBranches('master', 'origin/master');
          })
          .then(function() {
            releaseLock();
          });
      });
    });

    app.listen(5715);
  })
  .catch(function(err) {
    console.log('error opening repo: ' + err.message);
  });
