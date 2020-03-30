const svgWidth = 960
const svgHeight = 500

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

  let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// View selection - changing this triggers transition
let currentSelection = "poverty"

// Returns an updated scale based on the current selection.
function xScale(demoData, currentSelection) {
    let xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(demoData.map(d => parseFloat(d[currentSelection]))) * 0.8,
        d3.max(demoData.map(d => parseFloat(d[currentSelection]))) * 1.2
      ])
      .range([0, width])
  
    return xLinearScale
}

// Returns and appends an updated x-axis based on a scale.
 function renderAxes(newXScale, xAxis) {
   let bottomAxis = d3.axisBottom(newXScale)
 
   xAxis
     .transition()
     .duration(500)
     .call(bottomAxis)
 
   return xAxis
}

// Returns and appends an updated circles group based on a new scale and the currect selection.
function renderCircles(circlesGroup, newXScale, currentSelection) {
    circlesGroup
      .transition()
      .duration(500)
      .attr("cx", d => newXScale(d[currentSelection]))
  
    return circlesGroup
}

// Returns and appends an updated text group based on a new scale and the currect selection.
function renderText(textGroup, newXScale, currentSelection) {
    textGroup
      .transition()
      .duration(500)
      .attr("x", d => newXScale(d[currentSelection]) - 6)
  
    return textGroup
}


(function() {
    d3.csv("../data/data.csv").then(demoData => {
        let xLinearScale = xScale(demoData, currentSelection)
        let yLinearScale = d3
            .scaleLinear()
            .domain([0, d3.max(demoData.map(d => parseFloat(d.noHealthInsurance)))])
            .range([height, 0])

        demoData.map(d => console.log(d.poverty + "," + d.noHealthInsurance + "," +  d.abbr + ","))
        console.log(demoData[0])

        let bottomAxis = d3.axisBottom(xLinearScale)
        let leftAxis = d3.axisLeft(yLinearScale)
  
        let xAxis = chartGroup
            .append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis)
  
        chartGroup.append("g").call(leftAxis)
  
        let circlesGroup = chartGroup
            .selectAll("circle")
            .data(demoData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[currentSelection]))
            .attr("cy", d => yLinearScale(d.noHealthInsurance))
            .attr("r", 10)
            .attr("fill", "green")
            .attr("opacity", ".5")

        let textGroup = chartGroup
            .selectAll("text")
            .data(demoData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[currentSelection]))
            .attr("y", d => yLinearScale(d.noHealthInsurance) + 3)
            .attr("font-size", "10px")
            .style("text-anchor", "middle")
            .text(d => d.abbr)
  
        let labelsGroup = chartGroup
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`)
  
        labelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)")

        labelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)")

        labelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)")
  
        chartGroup
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left/3)
            .attr("x", 0 - height / 2)
            .attr("value", "noHealthInsurance")
            //.attr("dy", "4em")
            .attr("dx", "-4em")
            .classed("axis-text", true)
            .text("Lacks Healthcare (%)")
    
        // Crate an event listener to call the update functions when a label is clicked
        labelsGroup.selectAll("text").on("click", function() {
            let value = d3.select(this).attr("value")
            if (value !== currentSelection) {
                currentSelection = value
                xLinearScale = xScale(demoData, currentSelection)
                renderAxes(xLinearScale, xAxis)
                
                circlesGroup = renderCircles(
                    circlesGroup,
                    xLinearScale,
                    currentSelection
                )
                
                textGroup = renderText(
                    textGroup,
                    xLinearScale,
                    currentSelection
                )
            }
        })
    })
})()
    