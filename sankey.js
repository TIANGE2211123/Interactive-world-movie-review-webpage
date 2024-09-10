import * as d3 from 'd3';
import * as sankey from"d3-sankey";

export function _graph(data,d3)
{
  const keys = data.columns.slice(0, -1);
  let index = -1;
  const nodes = [];
  const nodeByKey = new d3.InternMap([], JSON.stringify);;
  const indexByKey = new d3.InternMap([], JSON.stringify);;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = [k, d[k]];
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }
  
  // console.log(nodes);
  // console.log(nodeByKey);
  // console.log(indexByKey);
let a, b;
  for (let i = 1; i < keys.length; ++i) {
     a = keys[i - 1];
     b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new d3.InternMap([], JSON.stringify);
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const value = d.value || 1;
      let link = linkByKey.get(names);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get([a, d[a]]),
        target: indexByKey.get([b, d[b]]),
        names,
        value
      };
      links.push(link);
      linkByKey.set(names, link);

      // console.log(links);
      // console.log(a);
      // console.log(links);
    }
  }
  return {nodes, links};
}


export function _chart(d3,graph)
{
  const width = 1300;
  const height = 800;

  const sankeyGenerator = sankey.sankey()
  .nodeSort(null)
  .linkSort(null)
  .nodeWidth(4)
  .nodePadding(20)
  .extent([[0, 5], [width, height - 5]]);

  console.log(sankeyGenerator);

  const color = d3.scaleOrdinal()
    .domain(graph.nodes.map(d => d.name))
    .range(["#FAA2A2", "#A2AAFA","#FAE7A2"]);


  console.log(color);

  const svg = d3.select("body")
      .append("svg")
      .attr("viewBox", [-300,0, width+300, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

console.log(svg);
  const {nodes, links} = sankeyGenerator({
    nodes: graph.nodes.map(d => Object.create(d)),
    links: graph.links.map(d => Object.create(d))
  });

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
    .selectAll("path.link")
    .data(links)
    .join("path") 
      .attr("class", "link")  // Add the 'link' class to the path element
      .attr("d", sankey.sankeyLinkHorizontal())
      .attr("stroke", d => color(d.names[0]))
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
    .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
 
 
      svg.append("g")
      .style("font", "25px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => `${d.name} (${d.value.toLocaleString()})`)
      .append("tspan")
        .attr("fill-opacity", 0.7);


  // Add axis labels
  svg.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text("Country")
      .style("font", "25px calibri")
      .style("font-weight", "bold")
  svg.append("text")
      .attr("x", width/3)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text("Release year")
      .style("font", "25px calibri")
      .style("font-weight", "bold")
    svg.append("text")
      .attr("x", width-width/3)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text("Duration")
      .style("font", "25px calibri")
      .style("font-weight", "bold")
    svg.append("text")
      .attr("x", width-50)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text("Collection")
      .style("font", "25px calibri")
      .style("font-weight", "bold")

  // Highlight (increase saturation) of links that are hovered upon
  // MouseOver event handler
  function handleMouseOver(d, i) {
    d3.select(this)
      .attr("stroke", function(d) {
        const hslColor = d3.hsl(color(d.names[0]));
      console.log(hslColor);
        hslColor.s += 3; // 增加选定链接的饱和度
        return hslColor.toString();
      });
  }

  // Mouseout event handler
  function handleMouseOut(d, i) {
    d3.select(this)
      .attr("stroke", d => color(d.names[0])); // Restore the original stroke color on mouseout
  }
    
  // Apply event handlers
  svg.selectAll("path.link")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  return svg.node();
}
