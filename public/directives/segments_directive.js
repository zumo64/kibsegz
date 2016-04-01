(function() {
  var app, d3bar;

  d3bar = require('../../lib/d3stackbar.js');

  app = require('ui/modules').get('app/segments', []);

  app.directive('segment', function($compile, $rootScope) {
    return {
      restrict: 'EA',
      scope: {
        metrics: '='
      },
      link: function($scope, $elem) {
        var drawGraph;
        drawGraph = function() {
          var aSegment, data, s, _i, _len, _ref;
          data = [];
          _ref = $scope.metrics.segments;
          for (s = _i = 0, _len = _ref.length; _i < _len; s = ++_i) {
            aSegment = _ref[s];
            data.push({
              segment: "" + s,
              docs: aSegment.num_docs,
              deleted: aSegment.deleted_docs
            });
          }
          if ((data != null) && data.length > 0) {
            d3bar($elem.get(0), data);
          }
        };
        $scope.$watch('metrics', function() {
          var myEl;
          myEl = angular.element(document.querySelector('div.d3-tip.n'));
          return myEl.remove();
        });
        drawGraph();
      }
    };
  });

}).call(this);
