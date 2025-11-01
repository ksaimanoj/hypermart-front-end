document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("items-table");
    const tbody = table.querySelector("tbody");

    async function fetchItems() {
        try {
            const response = await fetch('/admin/api/items');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const items = await response.json();
            populateTable(items);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    function populateTable(data) {
        tbody.innerHTML = "";
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.item_id}</td>
                <td>${item.item_name}</td>
                <td>${item.category}</td>
                <td>${item.brand}</td>
            `;
            tbody.appendChild(row);
        });
    }

    fetchItems();
});