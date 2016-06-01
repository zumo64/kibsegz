(function() {
  var $, chrome, moment, segmentsChooseIndex, uiModules, uiRoutes;

  moment = require('moment');

  chrome = require('ui/chrome');

  uiModules = require('ui/modules');

  uiRoutes = require('ui/routes');

  $ = require('jquery');

  require('plugins/kibsegz/directives/segments_directive');

  require('ui/autoload/styles');

  require('../less/main.less');

  require('../templates/bar.css');

  segmentsChooseIndex = require('../templates/index.html');

  chrome.setNavBackground('#222222').setTabs([]);

  uiRoutes.enable();

  uiRoutes.when('/', {
    template: segmentsChooseIndex,
    controller: 'mainController',
    controllerAs: 'ctrl'
  });

  uiModules.get('app/kibsegz', []).controller('mainController', function($http, $scope, $interval) {
    var getMetrics, indexName, nodeName, pro, selRate, selectedNodeId, startInterval;
    $scope.indices = [];
    $scope.nbNodes = 0;
    selectedNodeId = null;
    $scope.nodes = [];
    $scope.shards = [];
    $scope.rates = [
      {
        value: 0
      }, {
        value: 5
      }, {
        value: 10
      }
    ];
    selRate = 0;
    indexName = null;
    nodeName = null;
    pro = null;
    getMetrics = function() {
      if (!indexName || !nodeName) {
        return;
      }
      return $http.get("../api/kibsegz/" + $scope.selectedIndex.name).then(function(response) {
        var i, n, nbShards, numSegments, segmentDetails, segmentKey, segments, segmentsHead, shard, shardDetails, _i, _j, _ref;
        nbShards = response.data._shards.successful;
        shardDetails = response.data.indices["" + indexName].shards;
        for (i = _i = 0; 0 <= nbShards ? _i < nbShards : _i > nbShards; i = 0 <= nbShards ? ++_i : --_i) {
          shard = shardDetails["" + i];
          if (shard != null) {
            shard.segments = [];
            $scope.shards.push(shard);
            for (n = _j = 0, _ref = $scope.nbNodes; 0 <= _ref ? _j < _ref : _j > _ref; n = 0 <= _ref ? ++_j : --_j) {
              segmentsHead = shardDetails["" + i][n];
              if ((segmentsHead != null) && segmentsHead.routing.node === selectedNodeId) {
                numSegments = segmentsHead.num_search_segments;
                segments = segmentsHead.segments;
                for (segmentKey in segments) {
                  if (segments.hasOwnProperty(segmentKey)) {
                    segmentDetails = segments[segmentKey];
                    shard.segments.push(segmentDetails);
                  }
                }
              }
            }
          }
        }
      });
    };
    startInterval = function() {
      return pro = $interval(function() {
        $scope.shards = [];
        return getMetrics(indexName);
      }, selRate * 1000);
    };
    $http.get("../api/kibsegz/_stats").then(function(response) {
      var node, nodeIds, nodes, _i, _len, _results;
      if (response) {
        $scope.nbNodes = response.data._nodes.total;
        nodes = response.data.nodes;
        nodeIds = Object.keys(nodes);
        _results = [];
        for (_i = 0, _len = nodeIds.length; _i < _len; _i++) {
          node = nodeIds[_i];
          if (node) {
            _results.push($scope.nodes.push({
              name: nodes[node].name,
              id: node
            }));
          }
        }
        return _results;
      }
    });
    $http.get("../api/kibsegz/_health").then(function(response) {
      var index, _i, _len, _ref, _results;
      if (response.data != null) {
        _ref = response.data;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          index = _ref[_i];
          if (index) {
            _results.push($scope.indices.push({
              name: index
            }));
          }
        }
        return _results;
      } else {
        return alert("No indices available");
      }
    });
    $scope.onRateChange = function() {
      console.log("selected rate " + $scope.selectedRate.value);
      selRate = $scope.selectedRate.value;
      if (selRate > 0) {
        $interval.cancel(pro);
        startInterval();
      } else if (pro != null) {
        $interval.cancel(pro);
      }
    };
    $scope.onIndexChange = function() {
      if (pro != null) {
        $interval.cancel(pro);
      }
      indexName = "" + $scope.selectedIndex.name;
      $scope.shards = [];
      getMetrics();
      if (selRate > 0) {
        startInterval();
      }
    };
    return $scope.onNodeChange = function() {
      var node, _i, _len, _ref;
      if (pro != null) {
        $interval.cancel(pro);
      }
      nodeName = "" + $scope.selectedNode.name;
      _ref = $scope.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.name === nodeName) {
          selectedNodeId = node.id;
        }
      }
      $scope.shards = [];
      getMetrics();
      if (selRate > 0) {
        startInterval();
      }
    };
  });

}).call(this);
