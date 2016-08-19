/*
** diff difference utility (https://github.com/flitbit/diff) **
* kind - indicates the kind of change; will be one of the following:
*   N - property/element added
*   D - property/element deleted
*   E - property/element edited
*   A - change occurred within an array
*/

var app = angular.module('mainApp', []);

app.controller('mainCtrl', function($scope, $http, $q) {
  $scope.selectedCompare = 'ambari';
  $scope.config = {};

  $http.get("cluster-list").then(function(response){
    $scope.clusters = response.data;
   }, function(err){
     console.log(err);
   });

  $scope.configList = function(cluster, prop){
    if($scope.differences) $scope.differences = [];
    $http.get("config-list?cluster=" + cluster).then(function(response){
      $scope.config[prop] = response.data;
     }, function(err){
       console.log(err);
     });
  };

  $scope.getConfig = function(clusterName1, clusterName2, selectedConfig) {
    var tag1 = $scope.config.cluster1[selectedConfig].tag;
    var tag2 = '';
    if($scope.config.cluster2[selectedConfig]){
      tag2 = $scope.config.cluster2[selectedConfig].tag;
    }

    var promises = [];
    promises.push($http.get("properties?cluster=" + clusterName1 + '&type=' + selectedConfig + '&tag=' + tag1));
    if(tag2) promises.push($http.get("properties?cluster=" + clusterName2 + '&type=' + selectedConfig + '&tag=' + tag2));

    $q.all(promises).then(function(data){
      $scope.cluster1 = data[0].data;
      if(data[1]) {
        $scope.cluster2 = data[1].data;
      } else {
        $scope.cluster2 = {};
      }

      $scope.differences = DeepDiff($scope.cluster1, $scope.cluster2);
      if(!$scope.differences) $scope.differences = [{path: ['No differences']}];
    }).catch(function(err){
      console.log(err);
    });
  };

  $scope.postXml = function(){
  var postData = {
    xml1: $scope.xml1,
    xml2: $scope.xml2
  };
  $http.post('/xml-to-js', postData).then(function(response){
    if(response.data[0].error || response.data[1].error) return alert("Error parsing XML");
    $scope.xmlDiff = DeepDiff(response.data[0], response.data[1]);
    if(!$scope.xmlDiff) $scope.xmlDiff = [{path: ['No differences']}];
   }, function(err){
     console.log(err);
   });
  };

});
