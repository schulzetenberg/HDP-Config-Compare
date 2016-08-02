var config = require('config');
var Client = require('node-rest-client').Client;
var q = require('q');

var ambari = config.ambari.a1;
var clientOpts = {
  user: ambari.username,
  password: ambari.password
};
var client = new Client(clientOpts);

var configType = config.configTypes[0];
getTag(configType).then(getProperties).catch(function(err){
  console.log("Ambari API error", err);
});

// Hit Ambari API to get a list of latest configurations
function getTag(configType) {
  var defer = q.defer();
  client.get('http://' + ambari.host + ':' + ambari.port + '/api/v1/clusters/Sandbox?fields=Clusters/desired_configs', function(data, response) {
    dataJson = JSON.parse(data);

    var config = {
      tag: dataJson.Clusters.desired_configs[configType].tag,
      type: configType
    };
    defer.resolve(config);
  });
  return defer.promise;
}

// Get the configuration properties
function getProperties(config) {
  var defer = q.defer();
  client.get('http://' + ambari.host + ':' + ambari.port + '/api/v1/clusters/Sandbox/configurations?type=' + config.type + '&tag=' + config.tag, function(data, response) {
    dataJson = JSON.parse(data);
    console.log(dataJson.items[0].properties);
    defer.resolve();
  });
  return defer.promise;
}

module.exports = function () {
  return 'Hello, world';
};
