(function() {
  var app, d3bar;

  d3bar = require('../../lib/d3stackbar.js');

  app = require('ui/modules').get('app/kibsegz', []);

  app.directive('segment', function($compile, $rootScope, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        metrics: '=metrics'
      },
      link: function($scope, $elem) {
        var drawGraph;
        drawGraph = function() {
          var aSegment, children, data, s, toto, _i, _len, _ref;
          data = [];
          _ref = $scope.metrics.segments;
          for (s = _i = 0, _len = _ref.length; _i < _len; s = ++_i) {
            aSegment = _ref[s];
            data.push({
              segment: "" + s,
              num_docs: aSegment.num_docs,
              deleted: aSegment.deleted_docs,
              size: aSegment.size_in_bytes
            });
          }
          if ((data != null) && data.length > 0) {
            toto = $elem.get(0);
            children = $elem.children();
            d3bar($elem.get(0), data);
          }
        };
        $scope.$watch('metrics', function() {
          var myEl;
          myEl = angular.element(document.querySelector('div.d3-tip.n'));
          return myEl.remove();
        });
        return drawGraph();
      }
    };
  });

}).call(this);
