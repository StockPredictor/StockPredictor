const form = document.getElementById('stockForm');
const chartsContainer = document.getElementById('charts-container');

const loadingMessage = document.createElement('p');
loadingMessage.textContent = 'Loading prediction...';
loadingMessage.style.color = '#00c6ff';
loadingMessage.style.fontSize = '1.2em';
loadingMessage.style.marginTop = '20px';
loadingMessage.style.display = 'none';
form.parentNode.insertBefore(loadingMessage, form.nextSibling);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();
  if (!ticker) return;

  try {
    loadingMessage.style.display = 'block';
    chartsContainer.style.display = 'none';

    const response = await fetch(`/api/predict?ticker=${ticker}`);
    if (!response.ok) throw new Error('Prediction failed');
    const data = await response.json();

    drawChart('#actualChart', data.actual, data.actualDates, 'Past Year Price');
    drawChart('#futureChart', data.future, data.futureDates, 'Predicted Future Price');

    loadingMessage.style.display = 'none';
    chartsContainer.style.display = 'block';
  } catch (error) {
    loadingMessage.textContent = 'Error fetching prediction. Please try again.';
    console.error(error);
  }
});

function drawChart(svgSelector, prices, dates, label) {
  const svg = d3.select(svgSelector);
  svg.selectAll('*').remove(); // Clear old chart

  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%Y-%m-%d");
  const dateObjects = dates.map(d => parseDate(d));

  const x = d3.scaleTime()
    .domain(d3.extent(dateObjects))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([d3.min(prices) * 0.95, d3.max(prices) * 1.05])
    .range([innerHeight, 0]);

  const line = d3.line()
    .x((d, i) => x(dateObjects[i]))
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  g.append('path')
    .datum(prices)
    .attr('fill', 'none')
    .attr('stroke', '#00c6ff')
    .attr('stroke-width', 2)
    .attr('d', line);

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%b %d")));

  g.append('g')
    .call(d3.axisLeft(y));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .style('fill', '#00c6ff')
    .style('font-size', '16px')
    .text(label);
}
