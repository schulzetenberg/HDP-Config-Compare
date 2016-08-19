var config = require('config');
var Client = require('node-rest-client').Client;
var q = require('q');
var express = require('express');
var bodyParser = require('body-parser');
var api = require('./api');
var xml = require('./xml-parse');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/xml-to-js', function (req, res) {
  if(!req.body.xml1 || !req.body.xml2) return res.status(500).send({ error: 'Both XML fields required' });
  var promises = [xml.parse(req.body.xml1), xml.parse(req.body.xml2)];

  q.all(promises).then(function(data){
    res.json(data);
  }).catch(function(err){
    res.status(500).send({ error: err });
  });
});

app.get('/cluster-list', function (req, res) {
  res.json(Object.keys(config.ambari));
});

app.get('/config-list', function (req, res) {
  if(!req.query.cluster) return res.status(500).send({ error: 'No cluster name specified' });
  var ambari = config.ambari[req.query.cluster];
  if(!ambari) return res.status(500).send({ error: 'No configuration for cluster name of ' + req.query.cluster });

  var apiParams = {
    url: 'http://' + ambari.host + ':' + ambari.port + '/api/v1/clusters/' + ambari.clusterName + '?fields=Clusters/desired_configs',
    clientArgs: {
      user: ambari.username,
      password: ambari.password
    },
    requestArgs: {
      headers: { "X-Requested-By": "ambari" }
    }
  };

  api.get(apiParams).then(function(data){
    var dataJson = JSON.parse(data);
    if(!dataJson || !dataJson.Clusters || !dataJson.Clusters) return res.status(500).send({ error: 'Could not get config data from Ambari' });
    res.send(dataJson.Clusters.desired_configs);
  }).catch(function(err){
    res.status(500).send({ error: err });
  });

});

app.get('/properties', function (req, res) {
  if(!req.query.type || !req.query.tag) return res.status(500).send({ error: 'config type & tag must be specified' });
  if(!req.query.cluster) return res.status(500).send({ error: 'No cluster name specified' });
  var ambari = config.ambari[req.query.cluster];

  var apiParams = {
    url:  'http://' + ambari.host + ':' + ambari.port + '/api/v1/clusters/' + ambari.clusterName + '/configurations?type=' + req.query.type + '&tag=' + req.query.tag,
    clientArgs: {
      user: ambari.username,
      password: ambari.password
    },
    requestArgs: {
      headers: { "X-Requested-By": "ambari" }
    }
  };

  api.get(apiParams).then(function(data){
    var dataJson = JSON.parse(data);
    if(!dataJson || !dataJson.items || !dataJson.items[0]) return res.status(500).send({ error: 'Could not get properties data from Ambari' });
    res.json(dataJson.items[0].properties);
  }).catch(function(err){
    res.status(500).send({ error: err });
  });
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

module.exports = function () {
  return 'Hello, world';
};
