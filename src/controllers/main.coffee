moment =  require 'moment'
chrome =  require 'ui/chrome'
uiModules =  require 'ui/modules'
uiRoutes =  require 'ui/routes'
$ = require 'jquery'

require 'plugins/kibsegz/directives/segments_directive'
require 'ui/autoload/styles'
require '../less/main.less'
require '../templates/bar.css'

segmentsChooseIndex =  require '../templates/index.html'

uiRoutes.enable()
uiRoutes.when '/',
  template: segmentsChooseIndex,
  controller: 'mainController',
  controllerAs: 'ctrl'


uiModules
.get('app/kibsegz', [])
.controller 'mainController',   ($http,$scope,$interval) ->
  $scope.indices = []
  $scope.nbNodes = 0
  selectedNodeId = null
  $scope.nodes = []
  $scope.shards = []
  $scope.selectedRate = {value:"Refresh Rate"}
  $scope.rates = [$scope.selectedRate,{value:0},{value:5},{value:10}] 
  
  $scope.stats =  {}
  $scope.stats.tp = []
  $scope.tabSelected = 0
  
  selRate = 0
  indexName = null
  nodeName = null
  pro = null
  
  $tabs = $('.kuiTab');
  $selectedTab = undefined;

  if !$tabs.length
    throw new Error('$tabs missing')

  selectTab = (tab) ->
    if $selectedTab
      $selectedTab.removeClass('kuiTab-isSelected')

    $selectedTab = $(tab);
    $selectedTab.addClass('kuiTab-isSelected')
    if tab == $tabs[0]
      $scope.tabSelected= 0 
      #console.log "#{$scope.tabSelected}"    
    else if tab == $tabs[1]
      $scope.tabSelected = 1
      console.log "#{$scope.tabSelected}" 
    

  $tabs.on('click',  (event) ->
    selectTab(event.target)
    $scope.$apply() 
  )
# segments
  selectTab($tabs[0])
  
  
  getMetrics = () ->
    if !indexName or !nodeName
      return
    $http.get("../api/kibsegz/#{$scope.selectedIndex.name}").then (response) ->
      #nbShards = response.data._shards.successful
      #console.log "num shards #{nbShards} #{indexName}"
      #console.log JSON.stringify(response)
      
      shardDetails = response.data.indices["#{indexName}"].shards
      
      # iterate shards
      for shardNumber of shardDetails
        shard = shardDetails[shardNumber]
        if shard? 
          
          shard.segments = []
          
          pushedShard = false
          # iterate witin shard details
          #for n in [0...$scope.nbNodes]
          for segmentsHead in shardDetails[shardNumber]
            #segmentsHead = shardDetails[shardNumber][n]
            if segmentsHead? and segmentsHead.routing.node is selectedNodeId
              
              numSegments = segmentsHead.num_search_segments
              #console.log ".....num segments #{numSegments}"
              segments = segmentsHead.segments

              for segmentKey of segments
                if segments.hasOwnProperty(segmentKey)
                  segmentDetails = segments[segmentKey]
                  shard.segments.push(segmentDetails)
                  if !pushedShard
                    shard.isPrimary = segmentsHead.routing.primary
                    shard.isReplica = !segmentsHead.routing.primary
                    shard.nbShard = shardNumber
                    $scope.shards.push(shard)
                    pushedShard=true
        #console.log "#{$scope.shards.length}"
      return
  
  
  unpackSelectedNodeStats = (stats) ->
    
    for aTpstat of stats.thread_pool
      # sneak in the name ot the thread pool
      stats.thread_pool[aTpstat].name = aTpstat
      $scope.stats.tp.push(stats.thread_pool[aTpstat])
    console.log "done"
    return
    
  
  
  getSelectedNodeStats = () ->
    if !nodeName
      return
    $http.get("../api/kibsegz/#{selectedNodeId}/stats").then (response) ->
      #console.log JSON.stringify(response)
      unpackSelectedNodeStats(response.data.nodes["#{selectedNodeId}"])
      
  
  
  
  startInterval = () ->
    pro = $interval(() ->
      $scope.shards = []
      getMetrics(indexName)
    , selRate * 1000)
    
  
  $http.get("../api/kibsegz/_stats").then (response) ->
    if response
      #console.log "#{JSON.stringify(response)}"
      $scope.nbNodes = response.data._nodes.total
      nodes = response.data.nodes
      nodeIds = Object.keys(nodes)
      
      $scope.selectedNode = {name:"Select Node", id:0}
      $scope.nodes.push($scope.selectedNode)
      for node in nodeIds when node
        #console.log "#{node} #{nodes[node].name}"
        $scope.nodes.push({name:nodes[node].name, id:node})
      
  
  # Get list of indices
  $http.get("../api/kibsegz/_health").then (response) ->
    if response.data? 
      $scope.selectedIndex = {name:"Select Index"}
      $scope.indices.push($scope.selectedIndex)
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
  $scope.onIndexChange = () ->
    if pro?
      $interval.cancel(pro)
    #console.log "onChange #{$scope.selectedIndex.name}"
    indexName = "#{$scope.selectedIndex.name}"
    $scope.shards = []
    
    if $scope.tabSelected is 1
      getMetrics()
    
    if selRate > 0
      startInterval()
    return
 
  # index selection 
  $scope.onNodeChange = () ->
    if pro?
      $interval.cancel(pro)
    #console.log "onChange #{$scope.selectedIndex.name}"
    nodeName = "#{$scope.selectedNode.name}"
    for node in $scope.nodes
      if node.name is nodeName
        selectedNodeId = node.id
    
    $scope.shards = []
    if $scope.tabSelected is 0
      getSelectedNodeStats() 
    else if $scope.tabSelected is 1
      getMetrics()
    
    if selRate > 0
      startInterval()
    return
    
  
    
    
    
  
    
