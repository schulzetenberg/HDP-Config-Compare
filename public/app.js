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

  $http.get("cluster-list").then(function(response){
    $scope.clusters = response.data;
   }, function(err){
     console.log(err);
   });

  $scope.configList = function(cluster, scopeVar){
    if($scope.differences) $scope.differences = [];
    $http.get("config-list?cluster=" + cluster).then(function(response){
      $scope[scopeVar] = response.data;
     }, function(err){
       console.log(err);
     });
  };

  $scope.getConfig = function(){
    var selected = $scope.configs[$scope.selectedConfig];
    var selectedCompare = $scope.configsCompare[$scope.selectedConfig];

    var promises = [];
    promises.push($http.get("properties?cluster=" + $scope.selectedCluster + '&type=' + $scope.selectedConfig + '&tag=' + selected.tag));
    if(selectedCompare && selectedCompare.tag) promises.push($http.get("properties?cluster=" + $scope.compareCluster + '&type=' + $scope.selectedConfig + '&tag=' + selectedCompare.tag));

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

});
