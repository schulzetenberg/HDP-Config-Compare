var xml2js = require('xml2js');
var q = require('q');

exports.parse = function(xml){
  var defer = q.defer();
  var parser = new xml2js.Parser();
  parser.parseString(xml, function (err, result) {
    if(err) defer.resolve( { error: 'Error parsing XML' } );
    defer.resolve(result);
  });
  return defer.promise;
};
