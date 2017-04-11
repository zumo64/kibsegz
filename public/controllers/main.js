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

  uiRoutes.enable();

  uiRoutes.when('/', {
    template: segmentsChooseIndex,
    controller: 'mainController',
    controllerAs: 'ctrl'
  });

  uiModules.get('app/kibsegz', []).controller('mainController', function($http, $scope, $interval) {
    var $selectedTab, $tabs, getMetrics, getSelectedNodeStats, indexName, nodeName, pro, selRate, selectTab, selectedNodeId, startInterval, unpackSelectedNodeStats;
    $scope.indices = [];
    $scope.nbNodes = 0;
    selectedNodeId = null;
    $scope.nodes = [];
    $scope.shards = [];
    $scope.selectedRate = {
      value: "Refresh Rate"
    };
    $scope.rates = [
      $scope.selectedRate, {
        value: 0
      }, {
        value: 5
      }, {
        value: 10
      }
    ];
    $scope.stats = {};
    $scope.stats.tp = [];
    $scope.tabSelected = 0;
    selRate = 0;
    indexName = null;
    nodeName = null;
    pro = null;
    $tabs = $('.kuiTab');
    $selectedTab = void 0;
    if (!$tabs.length) {
      throw new Error('$tabs missing');
    }
    selectTab = function(tab) {
      if ($selectedTab) {
        $selectedTab.removeClass('kuiTab-isSelected');
      }
      $selectedTab = $(tab);
      $selectedTab.addClass('kuiTab-isSelected');
      if (tab === $tabs[0]) {
        return $scope.tabSelected = 0;
      } else if (tab === $tabs[1]) {
        $scope.tabSelected = 1;
        return console.log("" + $scope.tabSelected);
      }
    };
    $tabs.on('click', function(event) {
      selectTab(event.target);
      return $scope.$apply();
    });
    selectTab($tabs[0]);
    getMetrics = function() {
      if (!indexName || !nodeName) {
        return;
      }
      return $http.get("../api/kibsegz/" + $scope.selectedIndex.name).then(function(response) {
        var numSegments, pushedShard, segmentDetails, segmentKey, segments, segmentsHead, shard, shardDetails, shardNumber, _i, _len, _ref;
        shardDetails = response.data.indices["" + indexName].shards;
        for (shardNumber in shardDetails) {
          shard = shardDetails[shardNumber];
          if (shard != null) {
            shard.segments = [];
            pushedShard = false;
            _ref = shardDetails[shardNumber];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              segmentsHead = _ref[_i];
              if ((segmentsHead != null) && segmentsHead.routing.node === selectedNodeId) {
                numSegments = segmentsHead.num_search_segments;
                segments = segmentsHead.segments;
                for (segmentKey in segments) {
                  if (segments.hasOwnProperty(segmentKey)) {
                    segmentDetails = segments[segmentKey];
                    shard.segments.push(segmentDetails);
                    if (!pushedShard) {
                      shard.isPrimary = segmentsHead.routing.primary;
                      shard.isReplica = !segmentsHead.routing.primary;
                      shard.nbShard = shardNumber;
                      $scope.shards.push(shard);
                      pushedShard = true;
                    }
                  }
                }
              }
            }
          }
        }
      });
    };
    unpackSelectedNodeStats = function(stats) {
      var aTpstat;
      for (aTpstat in stats.thread_pool) {
        stats.thread_pool[aTpstat].name = aTpstat;
        $scope.stats.tp.push(stats.thread_pool[aTpstat]);
      }
      console.log("done");
    };
    getSelectedNodeStats = function() {
      if (!nodeName) {
        return;
      }
      return $http.get("../api/kibsegz/" + selectedNodeId + "/stats").then(function(response) {
        return unpackSelectedNodeStats(response.data.nodes["" + selectedNodeId]);
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
        $scope.selectedNode = {
          name: "Select Node",
          id: 0
        };
        $scope.nodes.push($scope.selectedNode);
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
        $scope.selectedIndex = {
          name: "Select Index"
        };
        $scope.indices.push($scope.selectedIndex);
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
      if ($scope.tabSelected === 1) {
        getMetrics();
      }
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
      if ($scope.tabSelected === 0) {
        getSelectedNodeStats();
      } else if ($scope.tabSelected === 1) {
        getMetrics();
      }
      if (selRate > 0) {
        startInterval();
      }
    };
  });

}).call(this);
