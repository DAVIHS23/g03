var margin = {top: 10, right: 10, bottom: 10, left: 10};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var projection = d3.geoNaturalEarth2()
    .scale([1300 /(2*Math.PI)])
    .center([0,15])
    .rotate([-9,0])
    .translate([width / 2, height / 2]);
// Map and projection.
var path = d3.geoPath()
    .projection(projection);

// Start by creating the svg area
var svg = d3.select("svg")
            .append("g")
            .attr("width", width)
            .attr("heigt", height)

   //create a tooltip
var tooltip = d3.select("div.tooltip");

// definiert die Karte
var data = d3.map(); //dies generiert ein Map-Objekt von D3. Hier können nun mit data.set("key1","value1") neue key-values-Paare ergänzt werden
var colorScale = d3.scaleThreshold()
        .domain([1, 100, 1000, 10000])
        .range(d3.schemeOranges[5]);

// Load external data and boot
d3.queue()
    .defer(d3.json, "../datasource/world.geojson")
    .defer(d3.csv, "../data/df_country_routes_counts.csv", 
            function(d) {
                data.set(d.country, +d.routes_count);})
    .await(ready);

function ready(error, topo) {
    if (error) throw error;
    
    // Mouse Hover-Over-Effect
    let mouseOver = function(d,i){
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .8)  //Deckkraft
            d3.select(this)
                .transition()
                .duration(1000)
                .style("opacity", 1) //Deckkraft
                .style("stroke","black")  //Strich, schwarz
            //adding function for the Tooltip
            d3.select("#my_dataviz")
                .style("visibility","visible");
            console.log("Daten Mouse Over: ",d);
            console.log(d.total);
            console.log(d.properties.name);
            return tooltip
                .style("hidden", false)
                .html(d.properties.name);
        }
    let mouseLeave = function(d){
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)  //Deckkraft
            d3.select(this)
                .transition() //Übergang
                .duration(200)
                .style("stroke","transparent");
            
        }
    let mouseMove = function(d){
                //formatieren mit Tausender-Separator
                const formattedTotal = d.total.toLocaleString();
                tooltip
                    .classed("hidden",false)
                    .style("top", (d3.event.pageY) + "px")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .html(d.properties.name + ": "+ formattedTotal + " Routen")                    
        }

        svg.append("g")  
            .selectAll("path") 
            .data(topo.features)
            .enter()
            .append("path")
            //draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
                )
            //set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function(d) {return "Country"})
            .style("opacity", .8)  //Deckkraft
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave",mouseLeave)
}
