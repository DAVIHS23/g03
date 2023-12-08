// set the dimensions and margins of the graph
const marginTree = { top: 10, right: 10, bottom: 10, left: 10 },
    widthTree = 600 - marginTree.left - marginTree.right,
    heightTree = 600 - marginTree.top - marginTree.bottom;

// append the svg object to the body of the page
const svgTree = d3.select("#my_treemap")
    .append("svg")
    .attr("width", widthTree + marginTree.left + marginTree.right)
    .attr("height", heightTree + marginTree.top + marginTree.bottom)
    .append("g")
    .attr("transform", `translate(${marginTree.left}, ${marginTree.top})`);

function renameSmallCountries(data) {
    const threshold = 0.005
    routesTotal = d3.sum(data, r => r.routes_count);
    countryData = d3.flatRollup(data, D => d3.sum(D, d=>d.routes_count), d => d.continent, d => d.country);
    smallCountries = countryData.filter(d => d[2] < threshold*routesTotal).map(d=>d[1]);
    data = data.map(function(d) {
        if (smallCountries.includes(d.country)) {
            d.country = "OTH";
        } 
        return d; })
    return data
}

// read the data
const file2 = "data/df_routes_grouped.csv";
d3.csv(file2).then(function (data) {
    data=renameSmallCountries(data);
    data = d3.flatRollup(data, D => d3.sum(D, d=>d.routes_count), d => d.continent, d => d.country)
    .map(a => ({"continent": a[0], "country": a[1], "routes_count": a[2]}));
    console.log("Treemap: data = ");
    console.log(data);

    const root = d3.stratify().path(d => d.continent + "/" + d.country)(data)
    .sum(d=>d ? d.routes_count : 0)
    .sort((a, b) => b.value - a.value);

    console.log("Treemap: root = ");
    console.log(root);
    
    //Compute the Layout
    d3.treemap()
        .size([widthTree, heightTree])
        .padding(2)(root);

    // prepare a color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10)

    // add the color of the rectangles:
    let selectedCountry = undefined;
    let selectedContinent = undefined;
    svgTree
    .selectAll("rect")
    .data(root.leaves())
    .join("rect")
        .attr("x", function (d) {return d.x0;})
        .attr("y", function (d) {return d.y0;})
        .attr("width", function (d) {return d.x1 - d.x0;})
        .attr("height", function (d) {return d.y1 - d.y0;})
        .style("stroke", "black")
        .style("fill-opacity", 0.8)
        .style("fill", function (d) {return color(d.data.continent);})
    // add handler for clicking on country rectangle
    .on("click", function handle(d, i) {
        let country = i.data.country;
        if (country===selectedCountry) {
            selectedCountry = undefined;
            selectedContinent = undefined;
        } else {
            selectedCountry = country;
            selectedContinent = i.data.continent;
        }
        console.log("selected country: " + selectedContinent + "/" + selectedCountry);
        d3.selectAll("#my_treemap rect").style("fill-opacity", "0.8");
        if (selectedCountry) {
            d3.select(this).style("fill-opacity", 1);
        }
        updateBarchart(selectedCountry, selectedContinent);
    });

    // add the text/label ot the rectangels
    rects = svgTree.selectAll("text")
        .data(root.leaves())
        .enter();
    rects.append("text")
        .attr("x", function (d) {return d.x0 + 5;}) // +10 to adjust position (more right)
        .attr("y", function (d) {return d.y0 + 15;}) // +20 to adjust position (lower)
        .text(d => d.data.country)
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
    rects.append("text")
        .attr("x", function (d) {return d.x0 + 5;}) // +10 to adjust position (more right)
        .attr("y", function (d) {return d.y0 + 30;}) // +20 to adjust position (lower)
        .text(d => d.value)
        .attr("font-size", "11px")
        .attr("fill", "white");

    d3.selectAll("rect")
});
