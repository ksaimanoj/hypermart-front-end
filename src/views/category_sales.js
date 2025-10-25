// JS for Category Sales View
window.onload = function() {
  document.getElementById('back-to-sales-btn').onclick = function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    let url = '/views/sales.html';
    const params = [];
    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
    if (params.length) url += '?' + params.join('&');
    window.location.href = url;
  };
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  if (startDate) {
    document.getElementById('start-date').value = startDate;
  }
  if (endDate) {
    document.getElementById('end-date').value = endDate;
  }
  if (category) {
    document.getElementById('category-title').textContent = `${category} Sales`;
    function fetchCategorySales() {
      const startDateVal = document.getElementById('start-date').value;
      const endDateVal = document.getElementById('end-date').value;
  const apiUrl = `/api/category_sales_by_date?category_name=${encodeURIComponent(category)}${startDateVal ? `&start_date=${encodeURIComponent(startDateVal)}` : ''}${endDateVal ? `&end_date=${encodeURIComponent(endDateVal)}` : ''}`;
      fetch(apiUrl)
        .then(res => res.json())
        .then(data => renderCategorySales(data));
    }
    // Initial fetch
    fetchCategorySales();
    // Optionally, add event listeners to date fields to refetch on change
    document.getElementById('start-date').addEventListener('change', fetchCategorySales);
    document.getElementById('end-date').addEventListener('change', fetchCategorySales);
  }
};

function renderCategorySales(data) {
  // Render chart and details for the category
  // Chart: group by date, sum total_sales
  const chartRows = [];
  const dateMap = {};
  data.forEach(row => {
    if (!dateMap[row.date]) {
      dateMap[row.date] = 0;
    }
    dateMap[row.date] += parseFloat(row.total_sales) || 0;
  });
  Object.keys(dateMap).sort().reverse().forEach(date => {
    chartRows.push({ date, total: dateMap[date] });
  });

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: true },
      animations: { enabled: true },
      zoom: { enabled: true },
    },
    series: [{
      name: 'total',
      data: chartRows.map(row => row.total)
    }],
    xaxis: {
      categories: chartRows.map(row => {
        const d = new Date(row.date);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }),
      title: { text: 'Date' },
      labels: { rotate: -45 },
      min: 0,
      max: 9
    },
    yaxis: {
      title: { text: 'Total' },
      decimalsInFloat: 0,
      labels: {
        formatter: function (val) {
          return Math.round(val);
        }
      }
    },
    title: { text: 'Category Sales Over Time', align: 'center' },
    tooltip: {
      y: {
        formatter: function (val) {
          return Math.round(val);
        }
      }
    },
    grid: { padding: { right: 20 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    markers: { size: 4 },
  };
  if (window.categorySalesChart) window.categorySalesChart.destroy();
  window.categorySalesChart = new ApexCharts(document.querySelector("#category-sales-chart"), chartOptions);
  window.categorySalesChart.render();

  // Table rendering
  const detailsDiv = document.getElementById('category-sales-details');
  let tableHtml = '<table style="width:100%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-radius:8px;overflow:hidden;">';
  tableHtml += '<thead><tr>';
  tableHtml += '<th>Date <span>(Day)</span></th>';
  tableHtml += '<th>Total Sales</th>';
  tableHtml += '</tr></thead>';
  tableHtml += '<tbody>';
  chartRows.forEach(row => {
    const d = new Date(row.date);
    tableHtml += `<tr>`;
    tableHtml += `<td>${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>`;
    tableHtml += `<td>${row.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';
  detailsDiv.innerHTML = tableHtml;

  // Total & Average Sales
  const totalSales = chartRows.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0);
  const averageSales = chartRows.length ? totalSales / chartRows.length : 0;
  const totalSalesDiv = document.getElementById('total-sales');
  if (totalSalesDiv) {
    totalSalesDiv.textContent = `Total : ${totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  const averageSalesDiv = document.getElementById('average-sales');
  if (averageSalesDiv) {
    averageSalesDiv.textContent = `Average : ${averageSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}
