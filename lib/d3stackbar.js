d3 = require('d3');
d3.tip = require('../lib/d3.tip.js')


module.exports = function(element,data) {
  
  var margin = {
    top: 100,
    right: 20,
    bottom: 30,
    left: 40
  },
  
  width = 360 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .rangeRound([height, 0]);

//  var color = d3.scale.ordinal()
//    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  //var color = d3.scale.ordinal().range(["#98abc5", "#8a89a6","#3a89a6"]);
  var color = d3.scale.ordinal().range(["#98abc5"]);


  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".1s"));
    
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<ul class='ultip'>"+
      "<li><strong>Docs :</strong> <span style='color:red'>" + d.y1 + "</span></li>"+
      "<li><strong>Deleted :</strong> <span style='color:red'>" + d.y2 + "</span></li>"+
      "<li><strong>Size(b) :</strong> <span style='color:red'>" + d.y3 + "</span></li>"+
      "</ul>";
    })

  var svg = d3.select(element).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);
  
    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "segment";
    }));
    
    
    
    var q = color.domain();

    // for each segment
     data.forEach(function(d) {
      var y0 = 0;
      d.docs = color.domain().map(function(name) {
       
          return {
            name: name,
            y0: y0,
            y1: +d.num_docs,
            y2: +d.deleted,
            y3: +d.size
          };
      });
      d.total = d.docs[0].y3;
      //d.total = d.docs[d.docs.length - 1].y1;
    });
    
    
    

    

    data.sort(function(a, b) {
      return b.total - a.total;
    });

    x.domain(data.map(function(d) {
      return d.segment;
    }));
    y.domain([0, d3.max(data, function(d) {
      return d.total;
    })]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
//      .text("Documents");

    var state = svg.selectAll(".state")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) {
        return "translate(" + x(d.segment) + ",0)";
      });

    state.selectAll("rect")
      .data(function(d) {
        return d.docs;
      })
      .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) {
        return y(d.y3);
      })
      .attr("height", function(d) {
        return y(d.y0) - y(d.y3);
      })
      .style("fill", function(d) {
        return color(d.name);
      }).on('mouseover', tip.show)
      .on('mouseout', tip.hide);

}
