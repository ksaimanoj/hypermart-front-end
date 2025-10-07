fetch('/api/sales')
    .then(res => res.json())
    .then(rows => {

        if (!rows.length) {
            const tbody = document.getElementById('sales-tbody');
            tbody.innerHTML = `<tr><td colspan="1}">No sales records found.</td></tr>`;
            return;
        }

        // ApexCharts rendering
        // Prepare data for chart: all points, zoom to first 10 initially
        const chartRows = rows;
        const chartOptions = {
            chart: {
                type: 'area',
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
                    // Show only day and month
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
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth' },
            markers: { size: 4 },
        };
        const chart = new ApexCharts(document.querySelector("#chart"), chartOptions);
        chart.render();


        // Table rendering
        const thead = document.getElementById('sales-thead');
        const tbody = document.getElementById('sales-tbody');
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Header row (HTML only, no style logic)
        let headerHtml = '<tr>';
        headerHtml += `<th>Date <span>(Day)</span></th>`;
        headerHtml += `<th>Total</th>`;
        headerHtml += '</tr>';
        thead.innerHTML = headerHtml;

        // Data rows
        let bodyHtml = '';
        rows.forEach(row => {
            let dateAttr = '';
            try {
                const d = new Date(row["date"]);
                if (!isNaN(d)) {
                    dateValue = `${d.toLocaleDateString()} (${d.toLocaleDateString(undefined, { weekday: 'long' })})</span>`;
                }
            } catch { }
            sumValue = row["sum"];
            sumValue = sumValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            dateAttr = ` data-date="${row["date"]}"`;
            bodyHtml += `<tr class="sales-row"${dateAttr}>`;
            bodyHtml += `<td>${dateValue === null || dateValue === undefined ? '' : dateValue}</td>`;
            bodyHtml += `<td>${sumValue === null || sumValue === undefined ? '' : sumValue}</td>`;
            bodyHtml += '</tr>';
        });
        tbody.innerHTML = bodyHtml;

        // Add click event for rows (delegated)
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
        tbody.innerHTML = `<tr><td colspan="1"><pre>${err}</pre></td></tr>`;
    });
