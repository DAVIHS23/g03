// set the dimensions and margins of the graph
const marginBar = {top: 30, right: 30, bottom: 30, left: 60},
    widthBar = 600 - marginBar.left - marginBar.right,
    heightBar = 600 - marginBar.top - marginBar.bottom;

// append the svg object to the body of the page
const svgBar = d3.select("#my_barchart")
.append("svg")
    .attr("width", widthBar + marginBar.left + marginBar.right)
    .attr("height", heightBar + marginBar.top + marginBar.bottom)
.append("g")
    .attr("transform", `translate(${marginBar.left},${marginBar.top})`);
svgBar.append("text")
    .attr("id", "barTitle")
    .attr("x", widthBar - 200)
    .attr("y", 10)
    //.attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")

// A function that create / update the plot for a given variable:
function updateBarchart(selCountry, selContinent) {
    // Load and aggregate data
    d3.csv("data/df_routes_grouped.csv").then(function(csvData) {
    var allData = renameSmallCountries(csvData);
    var data;
    if (selCountry) {
        data = d3.filter(allData, d => (d.country === selCountry) && (d.continent === selContinent));
    } else {
        data = d3.flatRollup(allData,
            D => d3.sum(D, d => d.routes_count),
            d => d.grade_fra_reduced)
            .map(e => ({"grade_fra_reduced": e[0], "routes_count": +e[1]}));
    }
    
    // X axis
    svgBar.select("g.xAxis").remove();
    const x = d3.scaleBand()
        .range([0, widthBar ])
        .domain(data.map(d => d.grade_fra_reduced).sort())
        .padding(0.2);
    svgBar.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${heightBar})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    svgBar.select("g.yAxis").remove();
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.routes_count)])
        .range([heightBar, 0]);
    svgBar.append("g")
        .attr("class","yAxis")
        .call(d3.axisLeft(y));
    
    // Bars
    svgBar.selectAll("rect").remove();
    svgBar.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.grade_fra_reduced))
        .attr("y", d => y(d.routes_count))
        .attr("width", x.bandwidth())
        .attr("height", d => heightBar - y(d.routes_count))
        .attr("fill", "#fd8d3c");
    });

    // Titel
    title = "Welt";
    if (selCountry) {
        title = selCountry;
    }
    svgBar.select("#barTitle")
        .text(title);
};
