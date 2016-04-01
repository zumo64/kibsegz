moment =  require 'moment'
chrome =  require 'ui/chrome'
uiModules =  require 'ui/modules'
uiRoutes =  require 'ui/routes'

#d3bar = require '../../lib/d3bar.js'
$ = require 'jquery'

require 'plugins/segments/directives/segments_directive'
# require '../directives/segments_directive.js'
require 'ui/autoload/styles'
require '../less/main.less'
require '../templates/bar.css'
#import template from './templates/index.html';
segmentsChooseIndex =  require '../templates/index.html'


chrome.setNavBackground('#222222').setTabs([])

uiRoutes.enable()
uiRoutes.when '/',
  template: segmentsChooseIndex,
  controller: 'mainController',
  controllerAs: 'ctrl'


uiModules
.get('app/segments', [])
.controller 'mainController',   ($http,$scope,$interval) ->
  $scope.indices = []
  $scope.shards = []
  $scope.rates = [{value:0},{value:5},{value:10}]
  selRate = 0
  indexName = null
  pro = null
  
  
  getMetrics = () ->
    $http.get("../api/segments/#{$scope.selectedIndex.name}").then (response) ->
      nbShards = response.data._shards.successful
      #console.log "num shards #{nbShards} #{indexName}"
      shardDetails = response.data.indices["#{indexName}"].shards
      
      for i in [0...nbShards]
        shard = shardDetails["#{i}"]
        shard.segments = []
    
        $scope.shards.push(shard)
        segmentsHead = shardDetails["#{i}"][0]
    
        numSegments = segmentsHead.num_search_segments
        #console.log ".....num segments #{numSegments}"
        segments = segmentsHead.segments

        for segmentKey of segments
          if segments.hasOwnProperty(segmentKey)
            segmentDetails = segments[segmentKey]
            shard.segments.push(segmentDetails)

    return
  
  
  
  
  startInterval = () ->
    pro = $interval(() ->
      $scope.shards = []
      getMetrics(indexName)
    , selRate * 1000)
    
  
  # Get list of indices
  $http.get("../api/segments/_health").then (response) ->
    if response.data? 
      for index in response.data when index
        $scope.indices.push({name:index})
    else
      alert "No indices available"
       
       
  $scope.onRateChange = () ->
    console.log "selected rate #{$scope.selectedRate.value}"
    selRate = $scope.selectedRate.value
    if selRate > 0
      $interval.cancel(pro)
      startInterval()
    else if pro?
      $interval.cancel(pro)
      
    return     
       
  # index selection 
  $scope.onChange = () ->
    if pro?
      $interval.cancel(pro)
    #console.log "onChange #{$scope.selectedIndex.name}"
    indexName = "#{$scope.selectedIndex.name}"
    $scope.shards = []
    getMetrics()
    if selRate > 0
      startInterval()
    
    
    return
    
    
    
    
  
    
