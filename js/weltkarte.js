
// Set width & height of the plot
const marginMap = {top: 10, right: 10, bottom: 10, left: 10};
const widthMap = 960 - marginMap.left - marginMap.right;
const heightMap = 520 - marginMap.top - marginMap.bottom;

// Start by creating the svg area
const svg_map = d3.select("#my_worldmap")
            .append("g")
            .attr("width", widthMap)
            .attr("heigt", heightMap)
            .attr("transform", "translate(" + marginMap.left + "," + marginMap.top + ")")
            .attr("viewBox", [0, 0, 200, 200]);

// Map and projeciton
const data = new Map();

const projection = d3.geoNaturalEarth2()
    .scale([1300 /(2*Math.PI)])
    .center([0,15])
    .rotate([-15,-9])
    .translate([widthMap / 2, heightMap / 2]);
const path = d3.geoPath()
    .projection(projection);

// Define color scale
const colorScale = d3.scaleThreshold()
        .domain([1, 100, 1000, 5000, 10000])
        .range(d3.schemeOranges[5]);

// Zoom funciton für weltkarte
let zoom = d3.zoom()
    .scaleExtent([1, 3])
    .on('zoom', handleZoom);

function handleZoom(event) {
    d3.select('svg#my_worldmap g')
        .attr('transform', event.transform);
}

function initZoom() {
    d3.select('svg#my_worldmap')
        .call(zoom);
}

function reset() {
    d3.select('svg#my_worldmap')
        .transition()
        .call(zoom.scaleTo, 1)
        .transition()
        .call(zoom.translateTo, 390, 240);
}

//START LEGEND
const x_MapLeg = d3.scaleLinear()
    .domain([0, 1])
    .rangeRound([600, 860]);

const legend = svg_map.append("g")
    .attr("id", "legend");

const legend_entry = legend.selectAll("g.legend")
    .data(colorScale.range().map(function (d) {
        d = colorScale.invertExtent(d);
            if (d[0] == NaN) d[0] = x_MapLeg.domain()[0];
            if (d[1] == null) d[1] = x_MapLeg.domain()[1];
            return d;
        }))
    .enter().append("g")
    .attr("class", "legend_entry");

const ls_w = 20;
const ls_h = 20;

legend_entry.append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
        return heightMap - (i * ls_h) - 2 * ls_h - 45;
    })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function (d, i) {
        return i === 0 ? "#feedde" : colorScale(d[0]);
    })
    .style("opacity", 0.8);

legend_entry.append("text")
    .attr("x", 30)
    .attr("y", function (d, i) {
        return heightMap - (i * ls_h) - ls_h - 51;
    })
    .text(function (d, i) {
        if (i === 0) return "Keine Daten vorhanden";
        if (d[1] < d[0]) return d[0];
        return d[0] + " - " + d[1];
    });


legend.append("text").attr("x", 0).attr("y", 320).text("Anzahl Routen im Land");


// Create a tooltip
const tooltip = d3.select("div.tooltip");

initZoom();

// Load external data and boot
Promise.all([
    d3.json("datasource/world.geojson"),
    d3.csv("data/df_routes_grouped.csv",
            function(d) {
                if (data.has(d.country)) {
                    data.set(d.country, data.get(d.country) + +d.routes_count);
                } else {
                data.set(d.country, +d.routes_count);
                }
        })
    ]).then(function(loadData){
        let topo = loadData[0]
        console.log(data)
    
    // Mouse Hover-Over-Effect
    let mouseOver = function(event, d){
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
            d3.select("#my_worldmap")
                .style("visibility","visible");
            return tooltip
                .style("hidden", false)
                .html(d.properties.name);
        }
    let mouseLeave = function(event, d){
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)  //Deckkraft
            d3.select(this)
                .transition() //Übergang
                .duration(200)
                .style("stroke","transparent"); 
        }
    let mouseMove = function(event, d){
                //formatieren mit Tausender-Separator
                const formattedTotal = d.total.toLocaleString();
                tooltip
                    .classed("hidden",false)
                    .style("top", (event.pageY) + "px")
                    .style("left", (event.pageX + 10) + "px")
                    .html(d.properties.name + ": "+ formattedTotal + " Routen")                    
        }

    svg_map.append("g")  
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
        .style("stroke", "grey")
        .attr("class", function(d) {return "Country"})
        .style("opacity", .8)  //Deckkraft
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave",mouseLeave)
})
