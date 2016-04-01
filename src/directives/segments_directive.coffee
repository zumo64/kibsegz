d3bar = require '../../lib/d3stackbar.js'

app = require('ui/modules').get('app/segments', [])

app.directive 'segment',  ($compile, $rootScope) ->
  restrict: 'EA'

  scope:
    metrics: '='
  link:  ($scope, $elem) ->
    
    drawGraph = () ->
      data = []
      for aSegment,s in $scope.metrics.segments
        #console.log "#{aSegment}"
        data.push(
          segment:"#{s}"
          docs:aSegment.num_docs,
          deleted:aSegment.deleted_docs
        )
      if data? and data.length > 0
        d3bar($elem.get(0), data)
      return
    
    # remove tips when refreshing
    $scope.$watch('metrics', ()->
      myEl = angular.element( document.querySelector( 'div.d3-tip.n' ) )
      myEl.remove())
   
    drawGraph()
   
    return
    
     
  