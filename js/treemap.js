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
            d.country_name = d.continent + " Others"
        } 
        return d; })
    return data
}

// read the data
const file2 = "data/df_routes_grouped.csv";
d3.csv(file2).then(function (data) {
    data=renameSmallCountries(data);
    data = d3.flatRollup(data, D => d3.sum(D, d=>d.routes_count), d => d.continent, d => d.country, d => d.country_name)
    .map(a => ({"continent": a[0], "country": a[1], "routes_count": a[3], "country_name": a[2]}));
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
            selectedCountryName = undefined;
            selectedContinent = undefined;
        } else {
            selectedCountry = country;
            selectedCountryName = i.data.country_name;
            selectedContinent = i.data.continent;
        }
        console.log("selected country: " + selectedContinent + "/" + selectedCountry + ", " + selectedCountryName);
        d3.selectAll("#my_treemap rect").style("fill-opacity", "0.8");
        if (selectedCountry) {
            d3.select(this).style("fill-opacity", 1);
        }
        updateBarchart(selectedCountry, selectedContinent, selectedCountryName);
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

    //Initialize legend
    const treemapLegendItemSize = 12;
    const treemapLegendSpacing = 4;
    const xOffset = 5;
    const yOffset = 5;
    const continents = ["Europe","Americas", "Asia", "Oceania", "Africa"];
    const treemap_legend = d3
        .select('#treemap_legend')
        .append('svg')
        .selectAll('.legendItem')
        .data(continents)
        .enter()
        .append('g')
        .attr('class', 'legendItem')
        .attr('transform', function(d, i) {
            const height = treemapLegendItemSize + treemapLegendSpacing;
            const offset = height * continents.length / 2;
            const horz = xOffset;
            const vert = i * height + offset + yOffset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    // Append colored rectangles to the legend
    treemap_legend
        .append('rect')
        .attr('width', treemapLegendItemSize)
        .attr('height', treemapLegendItemSize)
        .style('fill', color);

    //Append legend text
    treemap_legend
        //.enter()
        .append('text')
        .attr('x', xOffset + treemapLegendItemSize + 5)
        .attr('y', (d, i) => yOffset + 7)
        .text(function(d){ return d});		

        console.log("Treemap: root for Text = ");
        console.log(continents);

});

