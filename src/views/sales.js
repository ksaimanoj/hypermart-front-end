
function fetchSalesData(startDate, endDate) {
    let url = '/api/sales';
    const params = [];
    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
    if (params.length) url += '?' + params.join('&');

    fetch(url)
        .then(res => res.json())
        .then(rows => {
            if (!rows.length) {
                const tbody = document.getElementById('sales-tbody');
                tbody.innerHTML = `<tr><td colspan="2">No sales records found.</td></tr>`;
                return;
            }

            // ApexCharts rendering
            const chartRows = rows;
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
                    data: chartRows.map(row => row["sum"])
                }],
                xaxis: {
                    categories: chartRows.map(row => {
                        const d = new Date(row["date"]);
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
                title: { text: 'Sales Over Time', align: 'center' },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return Math.round(val);
                        }
                    }
                },
                grid: { padding: { right: 20 } },
                dataLabels: {
                    enabled: false
                },
                stroke: { curve: 'smooth' },
                markers: { size: 4 },
            };

            // Calculate total sales sum and update total-sales div
            const totalSales = chartRows.reduce((acc, row) => acc + (parseFloat(row["sum"]) || 0), 0);
            const totalSalesDiv = document.getElementById('total-sales');
            if (totalSalesDiv) {
                totalSalesDiv.textContent = `Total Sales: ${totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            }
            // Destroy previous chart if exists
            if (window.salesChart) window.salesChart.destroy();
            window.salesChart = new ApexCharts(document.querySelector("#chart"), chartOptions);
            window.salesChart.render();

            // Table rendering
            const thead = document.getElementById('sales-thead');
            const tbody = document.getElementById('sales-tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            let headerHtml = '<tr>';
            headerHtml += `<th>Date <span>(Day)</span></th>`;
            headerHtml += `<th>Total</th>`;
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;

            let bodyHtml = '';
            rows.forEach(row => {
                let dateAttr = '';
                let dateValue = '';
                try {
                    const d = new Date(row["date"]);
                    if (!isNaN(d)) {
                        dateValue = `${d.toLocaleDateString()} (${d.toLocaleDateString(undefined, { weekday: 'long' })})`;
                    }
                } catch { }
                let sumValue = row["sum"];
                sumValue = sumValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                dateAttr = ` data-date="${row["date"]}"`;
                bodyHtml += `<tr class="sales-row"${dateAttr}>`;
                bodyHtml += `<td>${dateValue === null || dateValue === undefined ? '' : dateValue}</td>`;
                bodyHtml += `<td>${sumValue === null || sumValue === undefined ? '' : sumValue}</td>`;
                bodyHtml += '</tr>';
            });
            tbody.innerHTML = bodyHtml;

            tbody.querySelectorAll('.sales-row').forEach(tr => {
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', function () {
                    const date = this.getAttribute('data-date');
                    if (date) window.location.href = `/daywise_sales?date=${date}`;
                });
            });
        })
        .catch(err => {
            const tbody = document.getElementById('sales-tbody');
            tbody.innerHTML = `<tr><td colspan="2"><pre>${err}</pre></td></tr>`;
        });
}

document.addEventListener('DOMContentLoaded', function () {
    // Set default date range to last 7 days
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 10);
    const formatDate = d => d.toISOString().slice(0, 10);
    if (startDateInput && endDateInput) {
        startDateInput.value = formatDate(lastWeek);
        endDateInput.value = formatDate(today);
        // Initial fetch with default range
        fetchSalesData(startDateInput.value, endDateInput.value);
    } else {
        // Fallback: fetch all if inputs not found
        fetchSalesData();
    }

    // Listen for changes on date inputs and update dashboard automatically
    function updateDashboard() {
        const startDate = startDateInput ? startDateInput.value : '';
        const endDate = endDateInput ? endDateInput.value : '';
        fetchSalesData(startDate, endDate);
        fetchCategorySalesData(startDate, endDate);
    }

    if (startDateInput) {
        startDateInput.addEventListener('change', updateDashboard);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', updateDashboard);
    }

    // Initial fetch for category sales
    if (startDateInput && endDateInput) {
        fetchCategorySalesData(startDateInput.value, endDateInput.value);
    } else {
        fetchCategorySalesData();
    }
});

function fetchCategorySalesData(startDate, endDate) {
    let url = '/api/category_sales';
    const params = [];
    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
    if (params.length) url += '?' + params.join('&');

    fetch(url)
        .then(res => res.json())
        .then(rows => {
            const thead = document.getElementById('category-sales-thead');
            const tbody = document.getElementById('category-sales-tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            // Add show/hide button if needed
            let showAll = false;
            let showBtn = document.getElementById('show-all-categories-btn');
            if (!showBtn) {
                showBtn = document.createElement('button');
                showBtn.id = 'show-all-categories-btn';
                showBtn.textContent = 'Show All Categories';
                showBtn.style.margin = '8px 0';
                const table = document.getElementById('category-sales-table');
                table.parentNode.insertBefore(showBtn, table);
            }

            if (!rows.length) {
                tbody.innerHTML = `<tr><td colspan="2">No category sales records found.</td></tr>`;
                showBtn.style.display = 'none';
                return;
            }

            // Header row
            let headerHtml = '<tr>';
            headerHtml += `<th>Category</th>`;
            headerHtml += `<th>Total Sales</th>`;
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;

            // Data rows
            let totalCategorySales = 0;
            function renderRows(limit) {
                let bodyHtml = '';
                const displayRows = typeof limit === 'number' ? rows.slice(0, limit) : rows;
                displayRows.forEach(row => {
                    let category = row["category_name"] || '';
                    let total = parseFloat(row["total_sales"]) || 0;
                    totalCategorySales += total;
                    bodyHtml += `<tr>`;
                    bodyHtml += `<td>${category}</td>`;
                    bodyHtml += `<td>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
                    bodyHtml += '</tr>';
                });
                tbody.innerHTML = bodyHtml;
            }

            // Initial render: show first 10
            renderRows(10);
            showBtn.style.display = rows.length > 10 ? 'inline-block' : 'none';
            showBtn.textContent = 'Show All Categories';

            // Optionally, display total category sales somewhere
            let totalDiv = document.getElementById('total-category-sales');
            if (totalDiv) {
                totalDiv.textContent = `Total Category Sales: ${totalCategorySales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            }

            // Toggle show/hide all
            showBtn.onclick = function () {
                if (showBtn.textContent === 'Show All Categories') {
                    renderRows();
                    showBtn.textContent = 'Show Top 10 Categories';
                } else {
                    renderRows(10);
                    showBtn.textContent = 'Show All Categories';
                }
            };
        })
        .catch(err => {
            const tbody = document.getElementById('category-sales-tbody');
            tbody.innerHTML = `<tr><td colspan="2"><pre>${err}</pre></td></tr>`;
            let showBtn = document.getElementById('show-all-categories-btn');
            if (showBtn) showBtn.style.display = 'none';
        });
}
