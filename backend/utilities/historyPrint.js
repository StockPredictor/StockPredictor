document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("history-container");

  try {
    const res = await fetch("/api/predictions");
    const predictions = await res.json();

    if (!predictions.length) {
      container.innerHTML = "<p>No prediction history found.</p>";
      return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Date</th>
          <th>Final Predicted Price</th>
          <th>Preview</th>
        </tr>
      </thead>
      <tbody>
        ${predictions.map((pred, index) => `
          <tr>
            <td>${pred.ticker}</td>
            <td>${new Date(pred.generatedAt).toLocaleString()}</td>
            <td>$${pred.finalPrice.toFixed(2)}</td>
            <td><canvas id="preview-${index}" width="150" height="50"></canvas></td>
          </tr>
        `).join("")}
      </tbody>
    `;

    container.innerHTML = "";
    container.appendChild(table);

    // Draw mini line graphs
    predictions.forEach((pred, index) => {
      const canvas = document.getElementById(`preview-${index}`);
      const ctx = canvas.getContext("2d");

      const prices = pred.futurePrices || [];
      if (prices.length < 2) return;

      const max = Math.max(...prices);
      const min = Math.min(...prices);
      const stepX = canvas.width / (prices.length - 1);
      const scaleY = (canvas.height - 10) / (max - min || 1);

      ctx.beginPath();
      ctx.strokeStyle = "#2c7be5";
      ctx.lineWidth = 1.5;

      prices.forEach((p, i) => {
        const x = i * stepX;
        const y = canvas.height - ((p - min) * scaleY) - 5;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

  } catch (err) {
    console.error("Error fetching history:", err);
    container.innerHTML = "<p>Failed to load history.</p>";
  }
});
