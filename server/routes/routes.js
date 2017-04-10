export default function (server) {
  
  server.route({
    path: '/api/kibsegz/_health',
    method: 'GET',
    handler(req, reply) {
      //reply({ time: (new Date()).toISOString() });
      //server.log(["info"],"***** got it");
        
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'cluster.state').then(function (response) {
        reply(Object.keys(response.metadata.indices));
      });
    }
  });
  
  server.route({
    path: '/api/kibsegz/_stats',
    method: 'GET',
    handler(req, reply) {
          server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'nodes.stats').then(function (response) {
        reply(response);
      });
    }
  });
  
  // Add a route to retrieve the status of an index by its name
  server.route({
    path: '/api/kibsegz/{index}',
    method: 'GET',
    handler(req, reply) {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'indices.segments', {
        index: req.params.index
      }).then(function (response) {
        reply(response);
      });
    }
  });
  
  // Node Stats per node
  server.route({
    path: '/api/kibsegz/{node}/stats',
    method: 'GET',
    handler(req, reply) {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'nodes.stats', {
        nodeId: req.params.node
      }).then(function (response) {
        reply(response);
      });
    }
  });
  
};
