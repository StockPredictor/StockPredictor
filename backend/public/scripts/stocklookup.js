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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stockForm");
  const deepSearchBtn = document.getElementById("deepSearchBtn");
  const deepSearchOutput = document.getElementById("deepSearchResult");

  let currentTicker = null;
  let futureUseData = null; // Declare futureUseData outside the event listeners

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ticker = document.getElementById("ticker").value.toUpperCase();
    currentTicker = ticker;

    // Clear and hide results
    deepSearchBtn.style.display = "none";
    deepSearchOutput.style.display = "none";
    deepSearchOutput.innerHTML = "";

    try {
      const res = await fetch(`/api/predict?ticker=${ticker}`);
      const data = await res.json();
      futureUseData = data; // Assign data to futureUseData

      // Render your D3 charts here (omitted)

      // Show Deep Search button
      deepSearchBtn.style.display = "inline-block";
    } catch (err) {
      console.error("Prediction error:", err);
    }
  });

  deepSearchBtn.addEventListener("click", async () => {
    if (!currentTicker) return;

    deepSearchBtn.innerText = "Analyzing...";
    deepSearchBtn.disabled = true;

    try {
      const res = await fetch('/api/llm-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticker: currentTicker,
          future: futureUseData?.future || []
        })
      });
      console.log("Response status:", res); // Log the response status
      const data = await res.json();

      if (data.reasoning) {
        deepSearchOutput.innerHTML = `
          <h3>LLM Financial Analysis</h3>
          <div style="white-space: pre-line; line-height: 1.5;">${data.reasoning}</div>
        `;
        deepSearchOutput.style.display = "block";
      } else {
        deepSearchOutput.innerHTML = "<p>Unable to retrieve deep analysis at this time.</p>";
        deepSearchOutput.style.display = "block";
      }
    } catch (err) {
      console.error("Deep search error:", err);
      deepSearchOutput.innerHTML = "<p>Server error occurred during deep search.</p>";
      deepSearchOutput.style.display = "block";
    }

    deepSearchBtn.innerText = "Perform Deep Search";
    deepSearchBtn.disabled = false;
  });
});

