import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// AI Disclaimer: Used AI to learn how to export function(s) to html
// Notice the "export" keyword. This makes it public.
export function main(
  div,
  data,
  user_income,
  user_race,
  margin,
  width,
  height,
  shp_size
) {
  const formatMoney = d3.format("$,.0f"); // Formula created with AI
  // Part 4: Graph Features Prep
  let domain = 140000;
  if (+user_income < 140000) {
    domain = 140000;
  } else {
    // learned Math.ceil function because of AI
    domain = Math.ceil(+user_income / 10000) * 10000;
  }
  console.log(+user_income < 140000);
  console.log("DOMAIN " + domain);

  const xIncScale = d3.scaleLinear().domain([0, domain]).range([0, width]);
  console.log(xIncScale);
  const customXTick = (d) => `${formatMoney(d)}`;

  // AI DISLCAIMER: Used Gemini for help with the y-axis
  const yRaceScale = d3
    .scaleBand()
    .range([0, height]) // Pixel range (top to bottom)
    .domain(data.map((d) => d.race_ethnc_gen)) // Map the 'race' column to the domain
    .padding(0.2);

  // Part 5: Shape Function Prep
  const male_col = "#4269DD";
  const fem_col = "#D03E84";
  function setColor(d, i) {
    let color; // Idea to define variable before if statements courtesy of AI
    if (d.sex === "female") {
      color = fem_col;
    } else {
      color = male_col;
    }
    return color;
  }

  // Step 5A) Prep p25, avg, p75 shapes
  function gen_inc_circle(d, i) {
    // This function will take the data and the sex (or color) and \
    // then basically make the shapes the respective color
    let inc_circle = d3.symbol().size(shp_size);

    return inc_circle();
  }

  const gen_inc_circle_legend = d3.symbol().size(shp_size);
  function genp25(d, i) {
    // This function will take the data and the sex (or color) and \
    // then basically make the shapes the respective color
    let p25 = d3.symbol().type(d3.symbolTriangle).size(shp_size);

    return p25();
  }
  const genp25_legend = d3.symbol().type(d3.symbolTriangle).size(shp_size);

  function genp75(d, i) {
    let p75 = d3.symbol().type(d3.symbolTriangle).size(shp_size);
    return p75();
  }

  const genp75_legend = d3.symbol().type(d3.symbolTriangle).size(shp_size);

  function gensq(d, i) {
    let avgsq = d3.symbol().type(d3.symbolSquare).size(shp_size);

    return avgsq();
  }
  const gensq_legend = d3.symbol().type(d3.symbolSquare).size(shp_size);

  // Part 6: Create graph one
  const svg = d3
    .select(div)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let graph = svg.append("g"); // Base

  // 6A) Append X Axis
  graph
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xIncScale).tickFormat(customXTick))
    .attr("class", "xaxis")
    .selectAll("text")
    .attr("transform", "translate(10,0)rotate(-45)")
    .style("text-anchor", "end");

  // 6B) Append Y Axis
  graph.append("g").call(d3.axisLeft(yRaceScale));

  // 6C) Make tooltip

  // 6D) Tooltip
  // 6D i) Tooltip Functions
  let tooltip = d3 // I can apparently just have one tooltip
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "p25_tip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("font-size", 10)
    .style("position", "absolute")
    .style("pointer-events", "none");

  // ii: Create function for mouseover
  let mouseover = function (event, d) {
    tooltip.style("opacity", 1); // The rest of the chunk is an AI suggestion
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };

  let mouseleave = function (d) {
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none"); // Remove highlight
  };

  // iii: Create function for mouse move (actual hover)
  let mousemove_p25 = function (event, d) {
    tooltip
      .html(
        `<b>25th Percentile</b> among ${d.race_ethnc_gen} ${
          d.sex
        }s: ${formatMoney(d.p25)} `
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");
  };

  let mousemove_p75 = function (event, d) {
    tooltip
      .html(
        `<b>75th Percentile</b> among ${d.race_ethnc_gen} ${
          d.sex
        }: ${formatMoney(d.p75)}`
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");
  };

  let mousemove_avg = function (event, d) {
    tooltip
      .html(
        `<b>Mean income</b> among ${d.race_ethnc_gen} ${d.sex}: ${formatMoney(
          d.avg
        )}`
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");
  };
  let mousemove_cir = function (event, d) {
    tooltip
      .html(`<b>Your income</b>: ${formatMoney(+user_income)}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");
  };
  // 6D) Add shapes

  // Make USER INCOME CIRCLE
  graph
    .selectAll(".income")
    .data(data)
    .join("path")
    .attr("class", "income_circle")
    .attr("d", function (d, i) {
      return gen_inc_circle(d, i);
    })
    .attr(
      "transform",
      `translate(${xIncScale(user_income)}, ${
        yRaceScale(user_race) + yRaceScale.bandwidth() / 2
      })`
    )
    .style("fill", "black")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove_cir)
    .on("mouseleave", mouseleave);
  // Make p25 triangle
  graph
    .selectAll(".p25")
    .data(data)
    .join("path")
    .attr("d", function (d, i) {
      return genp25(d, i);
    })
    .attr("class", function (d) {
      // Used AI to figure out how to apply a class based on the data, which was a lot easier than anticipated
      // Logic: Return "p25" PLUS the sex (e.g., "p25 female" or "p25 male")
      return "p25 " + d.sex;
    })
    .attr(
      "transform",
      (d, i) =>
        `translate(${xIncScale(d.p25)}, ${
          yRaceScale(d.race_ethnc_gen) + yRaceScale.bandwidth() / 2
        }) rotate(90)`
    )
    .style("fill", (d, i) => setColor(d, i))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove_p25)
    .on("mouseleave", mouseleave);

  // Make p75 triangle
  graph
    .selectAll(".p75")
    .data(data)
    .join("path")
    .attr("class", function (d) {
      // Used AI to figure out how to apply a class based on the data, which was a lot easier than anticipated
      // Logic: Return "p25" PLUS the sex (e.g., "p25 female" or "p25 male")
      return "p75 " + d.sex;
    })
    .attr("d", function (d, i) {
      return genp75(d, i);
    })
    .attr(
      "transform",
      (d, i) =>
        `translate(${xIncScale(d.p75)}, ${
          yRaceScale(d.race_ethnc_gen) + yRaceScale.bandwidth() / 2
        }) rotate(-90)`
    )
    .style("fill", (d, i) => setColor(d, i))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove_p75)
    .on("mouseleave", mouseleave);

  // Make avg_sq square
  graph
    .selectAll(".avgsq")
    .data(data)
    .join("path")
    .attr("class", function (d) {
      // Used AI to figure out how to apply a class based on the data, which was a lot easier than anticipated
      // Logic: Return "p25" PLUS the sex (e.g., "p25 female" or "p25 male")
      return "avgsq " + d.sex;
    })
    .attr("d", function (d, i) {
      return gensq(d, i);
    })
    .attr(
      "transform",
      (d, i) =>
        `translate(${xIncScale(d.avg)}, ${
          yRaceScale(d.race_ethnc_gen) + yRaceScale.bandwidth() / 2
        })`
    )
    .style("fill", (d, i) => setColor(d, i))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove_avg)
    .on("mouseleave", mouseleave);

  graph
    .selectAll(".lines")
    .data(data)
    .join("line")
    .attr("class", "line_p25_p75")
    .style("stroke", (d, i) => setColor(d, i))
    .attr("x1", (d) => xIncScale(d.p25))
    .attr("x2", (d) => xIncScale(d.p75))
    .attr("y1", function (d, i) {
      return yRaceScale(d.race_ethnc_gen) + yRaceScale.bandwidth() / 2;
    })
    .attr("y2", function (d, i) {
      return yRaceScale(d.race_ethnc_gen) + yRaceScale.bandwidth() / 2;
    });

  // 6E) Legend functions

  function mouseover_legend(element) {
    graph.selectAll(`${element}`).style("stroke", "black").style("opacity", 1);
  }
  function mouseleave_legend(element) {
    graph.selectAll(`${element}`).style("stroke", "none");
  }

  // 6F) Actual legend

  let legend = graph
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(10, ${height + 50})`);

  legend.append("text").text("Legend").style("font-size", "12px");

  let p25_key_fem = legend
    .append("g")
    .attr("class", "p25_key_fem")
    .attr("transform", "translate(10,20)");

  p25_key_fem
    .append("path")
    .attr("d", genp25_legend)
    .style("fill", fem_col)
    .attr("transform", "translate(0,0)rotate(90)")
    .on("mouseover", () => mouseover_legend(".p25.female"))
    .on("mouseleave", () => mouseleave_legend(".p25.female"));

  p25_key_fem
    .append("text")
    .text("25th percentile among females")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let p75_key_fem = legend
    .append("g")
    .attr("class", "p75_key_fem")
    .attr("transform", "translate(10,40)");

  p75_key_fem
    .append("path")
    .attr("d", genp25_legend)
    .style("fill", fem_col)
    .attr("transform", "translate(0,0)rotate(-90)")
    .on("mouseover", () => mouseover_legend(".p75.female"))
    .on("mouseleave", () => mouseleave_legend(".p75.female"));

  p75_key_fem
    .append("text")
    .text("75th percentile among females")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let sq_key_fem = legend
    .append("g")
    .attr("class", "sq_key_fem")
    .attr("transform", "translate(10,60)")
    .on("mouseover", () => mouseover_legend(".avgsq.female"))
    .on("mouseleave", () => mouseleave_legend(".avgsq.female"));

  sq_key_fem
    .append("path")
    .attr("d", gensq_legend)
    .style("fill", fem_col)
    .attr("transform", "translate(0,0)");

  sq_key_fem
    .append("text")
    .text("Average income among females")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let p25_key_male = legend
    .append("g")
    .attr("class", "p25_key_male")
    .attr("transform", "translate(200,20)");

  p25_key_male
    .append("path")
    .attr("d", genp25_legend)
    .style("fill", male_col)
    .attr("transform", "translate(0,0)rotate(90)")
    .on("mouseover", () => mouseover_legend(".p25.male"))
    .on("mouseleave", () => mouseleave_legend(".p25.male"));
  p25_key_male
    .append("text")
    .text("25th percentile among males")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let p75_key_male = legend
    .append("g")
    .attr("class", "p75_key_male")
    .attr("transform", "translate(200,40)");

  p75_key_male
    .append("path")
    .attr("d", genp25_legend)
    .style("fill", male_col)
    .attr("transform", "translate(0,0)rotate(-90)")
    .on("mouseover", () => mouseover_legend(".p75.male"))
    .on("mouseleave", () => mouseleave_legend(".p75.male"));

  p75_key_male
    .append("text")
    .text("75th percentile among males")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let sq_key_male = legend
    .append("g")
    .attr("class", "sq_key_male")
    .attr("transform", "translate(200,60)");

  sq_key_male
    .append("path")
    .attr("d", gensq_legend)
    .style("fill", male_col)
    .attr("transform", "translate(0,0)")
    .on("mouseover", () => mouseover_legend(".avgsq.male"))
    .on("mouseleave", () => mouseleave_legend(".avgsq.male"));

  sq_key_male
    .append("text")
    .text("Average income among males")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  let inc_circle = legend
    .append("g")
    .attr("class", "inc_circle")
    .attr("transform", "translate(400,40)");

  inc_circle
    .append("path")
    .attr("d", gen_inc_circle_legend)
    .style("fill", "black")
    .attr("transform", "translate(0,0)")
    .on("mouseover", () => mouseover_legend(".income"))
    .on("mouseleave", () => mouseleave_legend(".income"));

  inc_circle
    .append("text")
    .text("Your income")
    .attr("transform", "translate(15, 2.5)")
    .style("font-size", "10px");

  // Used AI to learn how to put a box around the legend

  let bbox = legend.node().getBBox();
  legend
    .insert("rect", ":first-child")
    .attr("x", bbox.x - 10) // Add 10px padding on left
    .attr("y", bbox.y - 10) // Add 10px padding on top
    .attr("width", bbox.width + 20) // Width + 20px total padding
    .attr("height", bbox.height + 20) // Height + 20px total padding
    .style("stroke", "gray")
    .style("fill", "none"); // Transparent background

  //  Part 7: Title
  let title = graph
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Wage Gap");
  // Males & Females in the Top 10 most populous metro areas"
  return graph;
}
