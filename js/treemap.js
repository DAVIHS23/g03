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

// read the data
const file2 = "data/df_routes_merged.csv";
d3.csv(file2).then(function (data) {
    data = d3.flatRollup(
        data,
        (D) => D.length,
        (d) => d.continent,
        (d) => d.country
    );
    console.log("Treemap: data = ");
    console.log(data);

    const root = d3.stratify().path((d) => d[0] + "/" + d[1])(data);

    console.log("Treemap: root = ");
    console.log(root);

    root.sum(function (d) {
        if (d) {
            return d[2];
        }
        return undefined;
    });
    
    //Compute the Layout
    d3.treemap()
        .size([widthTree, heightTree])
        .padding(2)(root);

    // prepare a color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10)

    // And an opacity scale
    var opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

    // add the color of the rectangles:
    var selectedCountry = undefined;
    svgTree
    .selectAll("rect")
    .data(root.leaves())
    .join("rect")
        .attr("x", function (d) {return d.x0;})
        .attr("y", function (d) {return d.y0;})
        .attr("width", function (d) {return d.x1 - d.x0;})
        .attr("height", function (d) {return d.y1 - d.y0;})
        .style("stroke", "black")
        .style("fill", function (d) {return color(d.data[0]);})
    // add handler for clicking on country rectangle
    .on("click", function handle(d, i) {
        let country = i.data[1];
        if (country===selectedCountry) {
            selectedCountry = undefined;
        } else {
            selectedCountry = country
        }
        console.log("selected country: " + selectedCountry);
        d3.selectAll("#my_treemap rect").style("stroke", "black");
        if (selectedCountry) {
            d3.select(this).style("stroke", "red");
        }
        updateBarchart(selectedCountry);
    });

    // add the text/label ot the rectangels
    svgTree
    .selectAll("text")
    .data(root.leaves())
    .join("text")
        .attr("x", function (d) {return d.x0 + 5;}) // +10 to adjust position (more right)
        .attr("y", function (d) {return d.y0 + 10;}) // +20 to adjust position (lower)
        .text(function (d) {return d.data[1];})
        .attr("font-size", "8px")
        .attr("fill", "white");

    d3.selectAll("rect")
});
