d3 = require('d3');
d3.tip = require('../lib/d3.tip.js')


module.exports = function(node,data) {
  
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

var color = d3.scale.ordinal().range(["#98abc5", "#8a89a6"]);


  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
    
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<ul class='ultip'>"+"<li><strong>Documents :</strong> <span style='color:red'>" + d.y1 + "</span></li>"+
      "<li><strong>Deleted :</strong> <span style='color:red'>" + d.y2 + "</span></li>"+
      "</ul>";
    })

  var svg = d3.select("segment").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);
  
  // var data = [
//     {segment: "A", num_docs: 100, deleted_docs : 455},
//     {segment: "B", num_docs: 2500, deleted_docs : 200},
//     {segment: "C", num_docs: 1299, deleted_docs : 455}
//   ]
  
  
  
 // d3.csv("data.csv", function(error, data) {
 //  if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "segment";
    }));

    // for each segment
    data.forEach(function(d) {
      var y0 = 0;
      d.docs = color.domain().map(function(name) {
        return {
          name: name,
          y0: y0,
          y1: y0 += +d[name],
          y2: +d.deleted
        };
      });
      d.total = d.docs[d.docs.length - 1].y1;
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
      .style("text-anchor", "end")
      .text("Documents");

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
        return y(d.y1);
      })
      .attr("height", function(d) {
        return y(d.y0) - y(d.y1);
      })
      .style("fill", function(d) {
        return color(d.name);
      }).on('mouseover', tip.show)
      .on('mouseout', tip.hide);

 //   removed legend 
 //   var legend = svg.selectAll(".legend")
 //      .data(color.domain().slice().reverse())
 //      .enter().append("g")
 //      .attr("class", "legend")
 //      .attr("transform", function(d, i) {
 //        return "translate(0," + i * 20 + ")";
 //      });
 //
 //    legend.append("rect")
 //      .attr("x", width - 18)
 //      .attr("width", 18)
 //      .attr("height", 18)
 //      .style("fill", color);
 //
 //    legend.append("text")
 //      .attr("x", width - 24)
 //      .attr("y", 9)
 //      .attr("dy", ".35em")
 //      .style("text-anchor", "end")
 //      .text(function(d) {
 //        return d;
 //      });


}
