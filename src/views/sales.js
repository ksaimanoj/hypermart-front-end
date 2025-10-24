
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

    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function () {
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';
            fetchSalesData(startDate, endDate);
        });
    }
});
