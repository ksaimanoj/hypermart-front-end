const urlParams = new URLSearchParams(window.location.search);
const date = urlParams.get('date');

if (!date) {
  const tbody = document.getElementById('daywise-tbody');
  tbody.innerHTML = '<tr><td>No date specified.</td></tr>';
} else {
  document.getElementById('title').textContent = `Daywise Sales for ${new Date(date).toLocaleDateString()}`;

  fetch('/api/daywise_sales?date=' + encodeURIComponent(date))
    .then(res => res.json())
    .then(rows => {
      const thead = document.getElementById('daywise-thead');
      const tbody = document.getElementById('daywise-tbody');
      thead.innerHTML = '';
      tbody.innerHTML = '';

      if (!rows.length) {
        tbody.innerHTML = '<tr><td>No sales records found for this date.</td></tr>';
        return;
      }

      // Find columns where not all values are null
      let columns = Object.keys(rows[0]);
      columns = columns.filter(col => rows.some(row => row[col] !== null && row[col] !== undefined));

      // Header row
      const headerRow = document.createElement('tr');
      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Data rows
      rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          let value = row[col];
          // Format date columns
          if (/date/i.test(col) && value) {
            try {
              const d = new Date(value);
              value = d.toLocaleDateString();
            } catch {}
          }
          // Format amount columns
          else if (/price|amount|total/i.test(col) && typeof value === 'number') {
            value = value.toLocaleString(undefined, {   maximumFractionDigits: 2 });
          }
          td.textContent = value === null || value === undefined ? '' : value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      const tbody = document.getElementById('daywise-tbody');
      tbody.innerHTML = `<tr><td><pre>${err}</pre></td></tr>`;
    });
}