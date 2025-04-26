document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("history-container");
  
    try {
      const response = await fetch('http://localhost:3000/api/history?ticker=AAPL');
      const historyData = await response.json();
  
      if (historyData.length === 0) {
        container.innerHTML = "<p>No stock data found.</p>";
        return;
      }
      
      container.innerHTML = "<p>Test Successful! Loading...</p>";
      
      // Create a simple table to display the data
      const table = document.createElement("table");
      table.border = "1";
      const headerRow = `
        <tr>
          <th>Date</th>
          <th>Open</th>
          <th>Close</th>
          <th>High</th>
          <th>Low</th>
          <th>Volume</th>
        </tr>
      `;
      table.innerHTML = headerRow;
  
      historyData.forEach(day => {
        const row = `
          <tr>
            <td>${day.date}</td>
            <td>${day.open.toFixed(2)}</td>
            <td>${day.close.toFixed(2)}</td>
            <td>${day.high.toFixed(2)}</td>
            <td>${day.low.toFixed(2)}</td>
            <td>${day.volume.toLocaleString()}</td>
          </tr>
        `;
        table.innerHTML += row;
      });
  
      container.innerHTML = ""; // Clear "Loading" message
      container.appendChild(table);
  
    } catch (error) {
      console.error('Error fetching stock history:', error);
      container.innerHTML = "<p>Error loading stock data. Please try again later.</p>";
    }
  });