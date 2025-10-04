fetch('/api/sales')
  .then(res => res.json())
  .then(rows => {
    if (!rows.length) {
      document.getElementById('table-container').innerHTML = '<p>No sales records found.</p>';
      return;
    }

    // Find columns where not all values are null
    let columns = Object.keys(rows[0]);
    let dateCol = columns.find(col => /date/i.test(col));
    // Remove rows without a date value
    if (dateCol) {
      rows = rows.filter(row => row[dateCol]);
    }
    columns = columns.filter(col => {
      if (/date/i.test(col)) {
        return rows.some(row => row[col]);
      }
      return rows.some(row => row[col] !== null && row[col] !== undefined);
    });
    // Re-find dateCol in case columns changed
    dateCol = columns.find(col => /date/i.test(col));

    // ApexCharts rendering
    const valueCol = columns.find(col => /sum|amount|total|price/i.test(col));
    if (dateCol && valueCol) {
      // Prepare data for chart: all points, zoom to first 10 initially
      const chartRows = rows;
      const chartOptions = {
        chart: {
          type: 'area',
          height: 350,
          toolbar: { show: true },
          animations: { enabled: false },
          zoom: { enabled: true },
        },
        series: [{
          name: valueCol.replace(/_/g, ' '),
          data: chartRows.map(row => row[valueCol])
        }],
        xaxis: {
          categories: chartRows.map(row => {
            if (!row[dateCol]) return '';
            const d = new Date(row[dateCol]);
            // Show only day and month
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }),
          title: { text: dateCol.replace(/_/g, ' ') },
          labels: { rotate: -45 },
          min: 0,
          max: 9
        },
        yaxis: {
          title: { text: valueCol.replace(/_/g, ' ') },
          decimalsInFloat: 0,
          labels: {
            formatter: function (val) {
              return Math.round(val);
            }
          }
        },
        title: { text: 'Sales Over Time', align: 'center' },
        tooltip: {
          y: {
            formatter: function(val) {
              return Math.round(val);
            }
          }
        },
        grid: { padding: { right: 20 } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        markers: { size: 4 },
      };
      const chart = new ApexCharts(document.querySelector("#chart"), chartOptions);
      chart.render();
    } else {
      document.getElementById('chart').innerHTML = '<p>Chart cannot be rendered: missing date or value column.</p>';
    }

    // Table rendering
    let html = '<table><thead><tr>';
    columns.forEach(col => {
      html += `<th>${col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
      if (/date/i.test(col)) html += ' <span style="font-weight:400; font-size:0.9em;">(Day)</span>';
      html += '</th>';
    });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        let value = row[col];
        // Format date columns and add day
        if (/date/i.test(col) && value) {
          try {
            const d = new Date(value);
            value = d.toLocaleDateString();
            const day = d.toLocaleDateString(undefined, { weekday: 'long' });
            value += ` <span style='color:#1976d2;font-size:0.95em;'>(${day})</span>`;
          } catch {}
        }
        // Format amount columns
        else if (/sum|amount|total|price/i.test(col) && typeof value === 'number') {
          value = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        html += `<td>${value === null || value === undefined ? '' : value}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('table-container').innerHTML = html;
  })
  .catch(err => {
    document.getElementById('table-container').innerHTML = `<pre>${err}</pre>`;
  });
