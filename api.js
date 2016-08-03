var Client = require('node-rest-client').Client;
var q = require('q');

/*
params = {
	url: url,
	clientArgs: clientArgs (optional),
  requestArgs: requestArgs (optional)
}
*/
exports.get = function(params) {
  var defer = q.defer();

  // If no args provided, use defaults
  if(!params.clientArgs) params.clientArgs = {};
  if(!params.requestArgs) params.requestArgs = {};

  var client = new Client(params.clientArgs);

  var request = client.get(params.url, params.requestArgs, function(data, response) {
    defer.resolve(data);
  });

  request.on('requestTimeout', function(req) {
    req.abort();
    defer.reject("Request has expired");
  });

  request.on('responseTimeout', function(res) {
    defer.reject("Response has expired");
  });

  request.on('error', function(err) {
    defer.reject("Request error", err.request.options);
  });

  return defer.promise;
};
