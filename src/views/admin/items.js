document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("items-table");
    const tbody = table.querySelector("tbody");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    const pageJumpInput = document.getElementById("page-jump");
    const jumpBtn = document.getElementById("jump-btn");

    let currentPage = 1;
    const pageSize = 100;
    let totalPages = 1;
    let totalItems = 0;
    let sortOption = 'item_id';

    async function fetchItems(page = 1, sort = sortOption) {
        try {
            const response = await fetch(`/admin/api/items?page=${page}&pageSize=${pageSize}&sort=${sort}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            // result: { items: [...], total: n }
            renderPage(result.items, page, Math.ceil(result.total / pageSize), result.total);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    function renderPage(pageItems, page, pages, total) {
        tbody.innerHTML = "";
        pageItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.item_id}</td>
                <td>${item.item_name}</td>
                <td>${item.category}</td>
                <td>${item.brand}</td>
                <td>${item.total_sales !== undefined ? item.total_sales : ''}</td>
                <td>${item.total_quantity !== undefined ? item.total_quantity : ''}</td>
            `;
            tbody.appendChild(row);
        });
        currentPage = page;
        totalPages = pages;
        totalItems = total;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        pageJumpInput.max = totalPages;
        pageJumpInput.value = currentPage;
    }

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            fetchItems(currentPage - 1, sortOption);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            fetchItems(currentPage + 1, sortOption);
        }
    });

    jumpBtn.addEventListener("click", () => {
        let page = parseInt(pageJumpInput.value, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            fetchItems(page, sortOption);
        }
    });

    pageJumpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            jumpBtn.click();
        }
    });

    // Listen for sort option change
    document.querySelectorAll('input[name="sort-option"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            sortOption = e.target.value;
            fetchItems(1, sortOption);
        });
    });

    fetchItems(1, sortOption);
});