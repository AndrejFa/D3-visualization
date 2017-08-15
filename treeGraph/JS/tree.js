$(document).ready(function(){
  // Set the dimensions and margins of the diagram
  var margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 720 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  // append the svg object to the treecontainer of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#treecanvas").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

  $("svg").css({left: 300, position:'relative'});
  var i = 0,
      duration = 750,
      root;

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([height, width]);

  function top_N_atc(unique, n=10) {
    //count each drug occurence
    var drug_counter = unique.reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});
    //return sorted top n drugs
    return Object.keys(drug_counter)
      .sort(function(i,j){
        return d3.descending(drug_counter[i],drug_counter[j]);
    }).slice(0, n);
  }

  function level(data, n=10) {
    //concatenate ATC5 arrays to get all unique atc values in each IDPerson in database
    var unique_atc5 = []
    data.forEach(function(d) {
      unique_atc5 = unique_atc5.concat(d.value);
    });
    //select top n atc5 values
    return top_N_atc(unique_atc5, n);
  }

  function make_tree_data(data, tree_root, n=5) {
    //tree_data container
    var tree_data = {"name": tree_root, "children":[]};
    //top node on first level
    var top_nodes = level(data, n);
    //second level node pairs container
    var pairs = [];
    //iterate over node on first level
    for (node of top_nodes) {
      //selected node children container
      var atcs = [];
      //for every patient
      data.forEach(function(d) {
        //has patient received current drug?
        if(d.value.some(function(atc) {return atc == node;}))  {
          //iterate over drugs patient has received in combination with current node
          for (atc of d.value) {
            //combination of node pair doesn't exist and current node is not equal current node
            if (!pairs.some(function(pair) {return pair == (atc+" "+node);}) && atc != node) {
              //create new pair and append it to all pairs
              pairs.push(node+" "+atc);
              //append received atc to all atcs for current node
              atcs.push(atc);
            }
          }
        }
      });
      //select top n nodes
      atcs = top_N_atc(atcs, n);
      //create object name:atc for top best atc
      var child = [];
      atcs.forEach(function(d) {child.push({"name":d});});
      //append to tree data
      tree_data.children.push({"name": node, "children":child});
    }
    return tree_data;
  }
  var button = d3.selectAll("input.button");
  var slider_range = d3.selectAll("input.slide");

  function graph(d, type, minDate, maxDate) {
    $("#slider").dateRangeSlider("disable");
    //debugger;
    //get time interval data
    var database = d.filter(function(d){
      var date = new Date(d.time)
      return date >= minDate && date <= maxDate;
    });
    //get ids and unique atc value for each id
    var id_unique_atc = d3.nest()
      .key(function(d) {return d.id;})
      .rollup(function(d) {
        return d3.map(d, function(atc) {return atc.ATC5;}).keys();
      })
      .entries(database);

    var tree = make_tree_data(id_unique_atc, type, 10);
    // Assigns parent, children, height, depth
    root = d3.hierarchy(tree, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);
    
    $("#calculation").hide();
    setTimeout(function(){
      $("#slider").dateRangeSlider("enable");
      $("input.button").attr("disabled", false);
    }, 1);
  }

  var dateMin = null,
      dateMax = null;
  var type_diabetes = null;
  button.on("change", null)
    .on("change", function(){
      if (type_diabetes == this.value) {
        return
      }
      type_diabetes = this.value; 
      setTimeout(function() {
        //disable for every button change except for first 
        if (dateMin != null) {
          $("#slider").dateRangeSlider("disable");
        }
        d3.csv("JS/podatki/"+type_diabetes+".csv", function(error, data){
          if (error) throw error;
          if (dateMin != null) {
            $("#slider").dateRangeSlider("destroy");
          }
          $("#slider").dateRangeSlider({
            range:{ 
              min: {days: 120},
              max: {days: 120} 
            },
            step:{ days: 1 },
            bounds:{
              min: new Date(2011, 0, 1),
              max: new Date(2015, 11, 31)  
            }
          });
          if (dateMin != null) {
            $("#slider").dateRangeSlider("values", dateMin, dateMax); 
          }
          $("#slider").bind("valuesChanged", null)
          .bind("valuesChanged", function(e, dates){      
            $("input.button").attr("disabled", true);
            $("#calculation").show();
            if (dateMin == dates.values.min && dateMax == dates.values.max) {
              return
            }
            dateMin = dates.values.min;
            dateMax = dates.values.max;

            //debugger;
            setTimeout(function() {
              graph(data, type_diabetes, dateMin, dateMax);
            }, 100);  
          });
          if (dateMin != null) {
            $("input.button").attr("disabled", true);
            $("#calculation").show();
            setTimeout(function() {
              graph(data, type_diabetes, dateMin, dateMax);
            }, 100);   
          }
        });
      }, 100);
  });
  var el = document.querySelector("input.button");
  var ev = new Event("change");
  el.dispatchEvent(ev);

  // Collapse the node and all it's children
  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }

  function update(source) {
    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 225});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { return d.data.name; });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
       });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('r', 6.5)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      })
      .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      update(d);
    }
  }
});