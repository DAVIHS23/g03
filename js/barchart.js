
// set the dimensions and margins of the graph
const marginBar = {top: 30, right: 30, bottom: 70, left: 60},
    widthBar = 600 - marginBar.left - marginBar.right,
    heightBar = 600 - marginBar.top - marginBar.bottom;

// append the svg object to the body of the page
const svgBar = d3.select("#my_barchart")
.append("svg")
    .attr("width", widthBar + marginBar.left + marginBar.right)
    .attr("height", heightBar + marginBar.top + marginBar.bottom)
.append("g")
    .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

// Initialize the X axis
const x = d3.scaleBand()
.range([ 0, widthBar ])
.padding(0.2);
const xAxis = svgBar.append("g")
.attr("transform", `translate(0,${heightBar})`);

// Initialize the Y axis
const y = d3.scaleLinear()
.range([ heightBar, 0]);
const yAxis = svgBar.append("g")
.attr("class", "myYaxis");


// A function that create / update the plot for a given variable:
function updateBarchart(selectedCountry) {
    console.log("selectedVar: " + selectedCountry);

    // Parse the Data
    d3.csv("data/df_routes_grouped.csv").then( function(data) {
    
    //sort data
    const customOrder = []
    function customSort(a,b) {
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);

        //If both element are in the custom Order, compare their indices
        if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
        }
        
        // if one element is in the custom order and the orhter is not, prioritize the one
        if (indexA !== -1) {
        return -1;
        } else if (indexB !== -1) {
        return 1;
        }

        //if neither element is in the custom order, use a default comparision
        return a.localeCompare(b);
    }

    // X axis
    const x = d3.scaleBand()
        .range([ 0, widthBar ])
        //.domain(data.map(d => d.grade_fra_reduced).sort((a,b) => d3.ascending(a,b)))
        .domain(data.map(d => d.grade_fra_reduced).sort(customSort))
        .padding(0.2);
    svgBar.append("g")
        .attr("transform", `translate(0, ${heightBar})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {return +d.routes_count})])
        .range([ heightBar, 0]);
    svgBar.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svgBar.selectAll("rect").remove();
    if (selectedCountry) {
        data = d3.filter(data, d => d.country === selectedCountry);
        svgBar.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.grade_fra_reduced))
        .attr("y", d => y(d.routes_count))
        .attr("width", x.bandwidth())
        .attr("height", d => heightBar - y(d.routes_count))
        .attr("fill", "#69b3a2");
    } else {
        data = d3.flatRollup(
            data,
            D => d3.sum(D, d => d.routes_count),
            d => d.grade_fra_reduced);
        svgBar.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", d => heightBar - y(d[1]))
            .attr("fill", "#69b3a2");
    }
    });
};


// Initialize plot
updateBarchart(undefined)
