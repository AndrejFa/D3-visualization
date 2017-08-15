$(document).ready(function(){
	//graph dimensions
	var margin = {top: 80, right: 60, bottom: 80, left: 80},
		width = 1000 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	//set ranges - convert to pixel space
	var x = d3.scalePoint().padding(.1).range([0, width]),
		y = d3.scaleLinear().range([height, 0]);

	//set axis
	var xAxis = d3.axisBottom(x),
		yAxis = d3.axisLeft(y);

	var ages = ["[0,5)","[05,10)","[10,15)","[15,20)","[20,25)","[25,30)","[30,35)","[35,40)","[40,45)","[45,50)","[50,55)","[55,60)","[60,65)","[65,70)","[70,75)","[75,80)","[80,85)","[85+"];

	//set line
	var line = d3.line()
		.x(function(d) {return x(d.key);})
		.y(function(d) {return y(d.value);});

	var confidenceArea = d3.area()
	    .x(function(d) { return x(d.key); })
	    .y0(function(d) {
	        return y(Math.max(0, d.value - d.se));})
	    .y1(function(d) {
	        return y(d.value + d.se);});

	//tooltip division
	var div = d3.select("#linechartcontainer")
		.append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);

	// Adds the svg canvas
	var svg = d3.select("#linechartcontainer")
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	        .attr("transform",
	              "translate(" + margin.left + "," + margin.top + ")");

	//add checkboxes
	var checkBox = d3.select("#linechartcontainer")
		.append("div")
		.attr("id", "checkBoxes")

	checkBox.selectAll("input")
		.data(["A10A - Insulins and analogues", "A10B - Blood glucose lowering drugs, excl. insulins"])
		.enter()
		.append("label")
			.attr("for", function(d) {return d.slice(0, 4);})
			.text(function(d) {return d;})
		.append("input")
			.attr("class", "insulin")
			.attr("type", "checkbox")
			.attr("value", function(d) {return d.slice(0, 4);})

	//add drop menues
	var DropMenu = d3.select("#linechartcontainer")
		.append("div")
		.attr("id", "DropMenu")

	var atcDropMenu = d3.select("#DropMenu")
		.append("div")
		.attr("id", "atcDrop")
		.append("select")
		.attr("name", "atcDropMenu")
		.attr("id", "atcMenu");

	var yearDropMenu = d3.select("#DropMenu")
		.append("div")
		.attr("id", "yearDrop")
		.append("select")
		.attr("name", "yearDropMenu")
		.attr("id", "yearMenu");

	//year file data
	var yearData = [
		{"year":2011, "file_name":"2011.csv"},
		{"year":2012, "file_name":"2012.csv"},
		{"year":2013, "file_name":"2013.csv"},
		{"year":2014, "file_name":"2014.csv"},
		{"year":2015, "file_name":"2015.csv"}
	]
	//set year drop down menu options
	yearDropMenu.selectAll("option")
		.data(yearData)
		.enter()
		.append("option")
		.text(function(d) {return d.year;})
		.attr("value", function(d) {return d.year;});

	//line colors
	var color = d3.scaleOrdinal().range(["blue", "red"]);

	//create legend
	var legend = d3.select("svg")
	    .append("g")
	    .attr("id", "legend-container")
	    .selectAll("g")
	    .data(["male", "female"])
	    .enter()
	    .append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) {
	      	return "translate(" + (width / 4 + i * 90) + "," + (height + margin.bottom + 50) + ")";
	      });
	legend.append("rect")
	    .attr("width", 20)
	    .attr("height", 1)
	    .style("fill", function(d) {return color(d);})
	    .style("stroke", function(d) {return color(d);});

	legend.append("text")
		.attr("class", "legendlabel")
	    .attr("x", 30)
	    .attr("y", 5)
	    .text(function(d) { return d;});

	//global variables
	var file_path;
	var atcIndex = 0;//24; //default ATC3 code index

	d3.select("#yearMenu").on("change", function() {
		file_path = "JS/podatki/" + yearData[this.selectedIndex].file_name;
		display(file_path);
	})

	//default graph year 2011 and atc C10
	display("JS/podatki/2011.csv");

	function display(file_path) {
		d3.csv(file_path, function(error, csvData) {

			//unable to load data
			if (error) throw error;
			var newData;
			d3.selectAll(".insulin")
				.on("change", null)
				.on("change", function(){
					var ch = [];
					d3.selectAll(".insulin").each(function(d) {
						var cb = d3.select(this);
						if (cb.property("checked")) {
							ch.push(cb.property("value"));
						}
				})
				//filter year data based on check box selection
				if (ch.length == 2) {
					newData = csvData.filter(function(d) {return d["atcDrug"] == "both";});
				} else if (ch.length == 1) {
					newData = csvData.filter(function(d) {return d["atcDrug"] == ch[0];});
				} else {
					newData = csvData;
				}
				
				d3.json("JS/podatki/atcCode.json", function(error, jsonData){
					//unable to load data
					if (error) throw error;

					//add options to drop down menu
					var atcOptions = atcDropMenu.selectAll("option")
						.remove()
						.exit()
						.data(jsonData)
						.enter()
						.append("option") 	
						.attr("value", function(d) {return d})
						.property("disabled", function(d) {
							if (Object.keys(newData[0]).indexOf(d.ATC3) < 0) {
								return true;
							}
							return newData.filter(function(row) { 
								return row[d.ATC3] && row[d.ATC3] === 'DA';
							}).length == 0;
						})
						.property("selected", function(d) {return d.ATC3 === jsonData[atcIndex].ATC3;});

					//add values to atc drop menu
					atcOptions.text(function(d) {return d.ATC3 + " - " + d.ATC3Description;})
						.attr("value", function(d) {return d.ATC3;});

					//update graph based on selected drop down menu value 
					d3.select("#atcMenu")
						.on("change", null)
						.on("change", function(){
						//get selected drop down atc code
						atcIndex = this.selectedIndex; 
						var	atc = jsonData[atcIndex].ATC3,
							title = jsonData[atcIndex].ATC3Description + " - " + jsonData[atcIndex].ATC3;

						updateGraph(newData, atc, title);
					});
					//programatically trigger the drop down menu change event
					var element = document.querySelector("#atcMenu");
					var event = new Event("change");
					element.dispatchEvent(event);
				});
				
			});
			//programatically trigger the check box change event
			var el = document.querySelector(".insulin");
			var ev = new Event("change");
			el.dispatchEvent(ev);
		});
	}

	 // Return standard error with 95% confidence
	function se95(p, n) {
	    return Math.sqrt(p*(1-p)/n)*1.96;
	};

	function updateGraph(csvData, atc, graphTitle) {
		//prepare data
		var receipt = csvData.filter(function(d) {return d[atc] == "DA"}),
			male = receipt.filter(function(d) {return d.spol == "moski";}),
			female = receipt.filter(function(d) {return d.spol == "zenska";});

		//gender fraction in each age interval
		var maledata = d3.nest()
			.key(function(d) {return d.starost;})
			//count values based on key (age interval) and divide with size of gender data
			.rollup(function(v) {return v.length / male.length;})
			.entries(male), 
			
			femaledata = d3.nest()
			.key(function(d) {return d.starost;})
			.rollup(function(v) {return v.length / female.length;})
			.entries(female);

		//age groups
		var maleMap = d3.map(maledata, function(d) {return d.key;}),
			femaleMap = d3.map(femaledata, function(d) {return d.key;});
		//add missing age group if any and set value to 0
		ages.forEach(function(d) {
			if (!maleMap.get(d)) {
				maleMap.set(d, {"key":d, "value":0.0});
			}
		});
		ages.forEach(function(d) {
			if(!femaleMap.get(d)) {
				femaleMap.set(d, {"key": d, "value": 0.0});
			}
		});

		var m = [],
			f = [];
		//calculate standard error for each gender and age interval
		//key is age interval
		//value is gender fraction in this age interval (decimal value)
		maleMap.entries().forEach(function(d) {
			m.push({"key": d.value.key, "value": d.value.value, "se": se95(d.value.value, csvData.length)});
		});
		femaleMap.entries().forEach(function(d) {
			f.push({"key": d.value.key, "value": d.value.value, "se": se95(d.value.value, csvData.length)});
		});
		//sort male and female data
		m.sort(function(i, j) {return d3.ascending(i.key, j.key)});
		f.sort(function(i, j) {return d3.ascending(i.key, j.key)});
		//add data with replaced [05, 10) with [5, 10)
		m.forEach(function (d) {
			if (d.key == "[05,10)") {
				m.push({"key": "[5,10)", "value": d.value, "se": d.se});
			} else {
				m.push(d);
			}
		});
		f.forEach(function (d) {
			if (d.key == "[05,10)") {
				f.push({"key": "[5,10)", "value": d.value, "se": d.se});
			} else {
				f.push(d);
			}
		});
		//select data for plot
		var	data = [{"gender":"male", "density": m.slice(m.length / 2, m.length)}, 
					{"gender":"female", "density": f.slice(f.length / 2, f.length)}];
		
		//scale in range of the data
		x.domain(["[0,5)","[5,10)","[10,15)","[15,20)","[20,25)","[25,30)","[30,35)","[35,40)","[40,45)","[45,50)","[50,55)","[55,60)","[60,65)","[65,70)","[70,75)","[75,80)","[80,85)","[85+"]);
		y.domain([0, d3.max(data, function(d) {return d3.max(d.density, function(v) {return v.value + v.se;});})]);
		
		//set lines
		var drawLine = svg.selectAll(".line")
			.remove()
			.exit()
			.data(data);

		drawLine.enter()
			.append("path")
			.attr("class", "line")
			.attr("stroke", function(d) {return color(d.gender);})
			.attr("d", function(d) {return line(d.density);});
		
		//add confidence area to the line
		svg.selectAll(".area").remove().exit();
		drawLine.enter()
			.append("path")
			.attr("class", "area")
			.attr("fill", function(d) {return color(d.gender);})
			.attr("opacity", 0.4)
			.attr("stroke", "none")
			.attr("d", function(d) {return confidenceArea(d.density);});
		
		//add dots to the line with tooltip
		svg.selectAll("circle").remove();
		svg.selectAll("dot")
			.data(data[0].density)
			.enter().append("circle")
			.attr("r", 4.5)
			.attr("cx", function(d) {return x(d.key);})
			.attr("cy", function(d) {return y(d.value);})
			.on("mouseover", function (d) {
	            div.transition()
	                .duration(200)
					.style("opacity", .9);
	            div.html("<p>in male group:" + Math.trunc(male.length * d.value) + "</p><p>total male:" + male.length + "</p><p>fraction: " + +d.value.toFixed(3) + " [CI: &plusmn" + +d.se.toFixed(3) + "]</p>")
	            	.style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY - 28) + "px");
	        })
	        .on("mouseout", function(d) {
		       div.transition()
		         .duration(500)
		         .style("opacity", 0);
		    })
	        .attr("fill", "white")
			.attr("stroke", function(d) {return color("male");})
			.attr("stroke-width", 3);
		
		svg.selectAll("dot")
			.data(data[1].density)
			.enter().append("circle")
			.attr("r", 4.5)
			.attr("cx", function(d) {return x(d.key);})
			.attr("cy", function(d) {return y(d.value);})
			.on("mouseover", function (d) {
	            div.transition()
	                .duration(200)
					.style("opacity", .9);
	            div.html("<p>in female group: " + Math.trunc(female.length * d.value) + "</p><p>total female: " + female.length + "</p><p>fraction: " + +d.value.toFixed(3) + " [CI: &plusmn" + +d.se.toFixed(3) + "]</p>")
	            	.style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY - 28) + "px");
	        })
	        .on("mouseout", function(d) {
		       div.transition()
		         .duration(500)
		         .style("opacity", 0);
	        })
	        .attr("fill", "white")
			.attr("stroke", function(d) {return color("female");})
			.attr("stroke-width", 3);

		//remove axis
		svg.selectAll(".axis").remove();
		svg.selectAll(".axislabel").remove();
		// Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis)
	   //x axis label
	   svg.append("text")
	        .attr("class", "axislabel")
	        .attr("transform", "translate(" + (width/2) + " ," + (height + margin.bottom / 2) + ")")
	      	.style("text-anchor", "middle")
	        .text("Age");

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis);
	    //y axis label
	    svg.append("text")
	    	.attr("class", "axislabel")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 0 - margin.left / 1.5)
	        .attr("x",0 - (height / 2))
	        .style("text-anchor", "middle")
	        .text("Fraction");
	    
	    svg.selectAll(".title").remove();
	    //add graph title
	    svg.append("text")
	    	.attr("class", "title")
	        .attr("x", (width / 2))             
	        .attr("y", 0 - (margin.top / 2))
	        .attr("text-anchor", "middle")  
	        .style("font-size", "20px") 
	       //.style("text-decoration", "underline")  
	        .text("Age group risk, for " + graphTitle + ", by gender");
	}
});