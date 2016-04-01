(function() {
  var $, chrome, moment, segmentsChooseIndex, uiModules, uiRoutes;

  moment = require('moment');

  chrome = require('ui/chrome');

  uiModules = require('ui/modules');

  uiRoutes = require('ui/routes');

  $ = require('jquery');

  require('plugins/segments/directives/segments_directive');

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

  uiModules.get('app/segments', []).controller('mainController', function($http, $scope, $interval) {
    var getMetrics, indexName, pro, selRate, startInterval;
    $scope.indices = [];
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
    pro = null;
    getMetrics = function() {
      $http.get("../api/segments/" + $scope.selectedIndex.name).then(function(response) {
        var i, nbShards, numSegments, segmentDetails, segmentKey, segments, segmentsHead, shard, shardDetails, _i, _results;
        nbShards = response.data._shards.successful;
        shardDetails = response.data.indices["" + indexName].shards;
        _results = [];
        for (i = _i = 0; 0 <= nbShards ? _i < nbShards : _i > nbShards; i = 0 <= nbShards ? ++_i : --_i) {
          shard = shardDetails["" + i];
          shard.segments = [];
          $scope.shards.push(shard);
          segmentsHead = shardDetails["" + i][0];
          numSegments = segmentsHead.num_search_segments;
          segments = segmentsHead.segments;
          _results.push((function() {
            var _results1;
            _results1 = [];
            for (segmentKey in segments) {
              if (segments.hasOwnProperty(segmentKey)) {
                segmentDetails = segments[segmentKey];
                _results1.push(shard.segments.push(segmentDetails));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          })());
        }
        return _results;
      });
    };
    startInterval = function() {
      return pro = $interval(function() {
        $scope.shards = [];
        return getMetrics(indexName);
      }, selRate * 1000);
    };
    $http.get("../api/segments/_health").then(function(response) {
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
    return $scope.onChange = function() {
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
  });

}).call(this);
