const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("india.geojson").then(data => {
    const projection = d3.geoMercator()
        .fitSize([width, height], data);

    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", pathGenerator);
});