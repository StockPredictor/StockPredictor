const form = document.getElementById('stockForm');
const table = document.getElementById('resultsTable');
const tbody = table.querySelector('tbody');

// Create and configure a loading message
const loadingMessage = document.createElement('p');
loadingMessage.textContent = 'Loading prediction...';
loadingMessage.style.color = '#00c6ff';
loadingMessage.style.fontSize = '1.2em';
loadingMessage.style.marginTop = '20px';
loadingMessage.style.display = 'none'; // Hidden by default
form.parentNode.insertBefore(loadingMessage, form.nextSibling); // Insert before the table...?

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();
  if (!ticker) return;

  try {
    // Show loading message
    loadingMessage.style.display = 'block';
    table.style.display = 'none'; // Hide the table while loading

    const response = await fetch(`/api/predict?ticker=${ticker}`);
    if (!response.ok) throw new Error('Prediction failed');
    const data = await response.json();

    // Clear previous table rows
    tbody.innerHTML = '';

    // Add new rows
    for (const [key, value] of Object.entries(data)) {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      keyCell.textContent = key;
      const valueCell = document.createElement('td');
      valueCell.textContent = value;
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      tbody.appendChild(row);
    }

    // Hide loading message, show table
    loadingMessage.style.display = 'none';
    table.style.display = 'table';
  } catch (error) {
    loadingMessage.textContent = 'Error fetching prediction. Please try again.';
    console.error(error);
  }
});
