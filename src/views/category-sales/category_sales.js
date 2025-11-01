// JS for Category Sales View
window.onload = function() {
  // Listen for Awesomplete selection and fetch sales data
  document.getElementById('category-selection').addEventListener('awesomplete-selectcomplete', function(e) {
    fetchCategorySales();
  });
  // Fetch categories and populate datalist
  let allCategories = [];
  // Ensure input is available before initializing Awesomplete
  function initAwesomplete(categories) {
    // Add 'Uncategorized' as a new entry
    allCategories = categories.map(cat => cat.category_name || cat.category);
    allCategories.unshift('uncategorized');

    const input = document.getElementById('category-selection');
    if (input) {
      input.setAttribute('data-awesomplete', '');
      input.awesomplete = new Awesomplete(input, {
        list: allCategories,
        minChars: 0,
        autoFirst: true,
        filter: Awesomplete.FILTER_CONTAINS,
        sort: false
      });
      // Autopopulate category from URL if present
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      if (category) {
        input.value = category;
        fetchCategorySales();
      } else {
        input.value = '';
      }
    } else {
      setTimeout(() => initAwesomplete(categories), 100);
    }
  }

  fetch('/api/categories')
    .then(res => res.json())
    .then(initAwesomplete);
  document.getElementById('back-to-sales-btn').onclick = function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    let url = '/views/sales/sales.html';
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

  const startDateKey = 'startDate';
  const endDateKey = 'endDate';

  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  // Load stored dates from local storage if available
  const storedStartDate = localStorage.getItem(startDateKey);
  const storedEndDate = localStorage.getItem(endDateKey);

  if (storedStartDate) {
    startDateInput.value = storedStartDate;
  }
  if (storedEndDate) {
    endDateInput.value = storedEndDate;
  }

  // Save updated date values to local storage on change
  startDateInput.addEventListener('change', function() {
    localStorage.setItem(startDateKey, startDateInput.value);
  });

  endDateInput.addEventListener('change', function() {
    localStorage.setItem(endDateKey, endDateInput.value);
  });

  function fetchCategorySales() {
    const categoryVal = document.getElementById('category-selection').value;
    const startDateVal = document.getElementById('start-date').value;
    const endDateVal = document.getElementById('end-date').value;
    if (!categoryVal) return;
    const apiUrl = `/api/category_sales_by_date?category_name=${encodeURIComponent(categoryVal)}${startDateVal ? `&start_date=${encodeURIComponent(startDateVal)}` : ''}${endDateVal ? `&end_date=${encodeURIComponent(endDateVal)}` : ''}`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => renderCategorySales(data));
  }


  // Add event listeners to fetch sales data on selection/change
  document.getElementById('category-selection').addEventListener('change', fetchCategorySales);
  document.getElementById('start-date').addEventListener('change', fetchCategorySales);
  document.getElementById('end-date').addEventListener('change', fetchCategorySales);
};

function renderCategorySales(data) {
  // Render chart and details for the category
  // Table rendering: show all item values for each category
  const detailsDiv = document.getElementById('category-sales-details');
  let tableHtml = '<table style="width:100%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-radius:8px;overflow:hidden;">';
  tableHtml += '<thead><tr>';
  tableHtml += '<th>Item Code</span></th>';
  tableHtml += '<th>Item Name</th>';
  tableHtml += '<th>Quantity</th>';
  tableHtml += '<th>Price</th>';
  tableHtml += '<th>Total Sales</th>';
  tableHtml += '</tr></thead>';
  tableHtml += '<tbody>';
  data.forEach(row => {
    const d = new Date(row.date);
    tableHtml += `<tr>`;
    tableHtml += `<td>${row.item_code}</td>`;
    tableHtml += `<td>${row.item_name}</td>`;
    tableHtml += `<td>${row.quantity}</td>`;
    tableHtml += `<td>${parseFloat(row.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
    tableHtml += `<td>${parseFloat(row.total_sales).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';
  detailsDiv.innerHTML = tableHtml;


}
