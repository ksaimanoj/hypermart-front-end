const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const filePath = path.join(__dirname, '../../resources/items_oct.xlsx');

// Read the workbook
const workbook = XLSX.readFile(filePath);

// Get the first sheet name
const sheetName = workbook.SheetNames[0];

// Get all rows as arrays (no headers)
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false });

// Use the header row
const headers = rows[2];

// Get data rows (from the row after header)
const dataRows = rows.slice(3);

// Map data rows to objects using the headers
console.log('Type of Headers:', typeof headers);

const items = dataRows.map(row => {
	const item = {};
	headers.forEach((header, idx) => {
		if (header) item[header] = row[idx];
	});
	return item;
});

module.exports = items;