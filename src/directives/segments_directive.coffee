d3bar = require '../../lib/d3stackbar.js'

app = require('ui/modules').get('app/kibsegz', [])

app.directive 'segment',  ($compile, $rootScope, $timeout) ->
  restrict: 'E'
  replace: true
  scope:
    metrics: '=metrics'
  link:  ($scope, $elem) ->

    drawGraph = () ->
      data = []
      for aSegment,s in $scope.metrics.segments
        #console.log "#{aSegment}"
        data.push(
          segment:"#{s}"
          num_docs:aSegment.num_docs,
          deleted:aSegment.deleted_docs
          size:aSegment.size_in_bytes
        )
      if data? and data.length > 0
        toto = $elem.get(0)
        children = $elem.children()
        d3bar($elem.get(0), data)
      return

    # remove tips when refreshing
    $scope.$watch('metrics', ()->
      myEl = angular.element( document.querySelector( 'div.d3-tip.n' ) )
      myEl.remove())


    drawGraph()
  
    
     
  
  
  
  
  