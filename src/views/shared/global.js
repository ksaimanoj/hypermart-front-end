// Save date range to localStorage
// This script ensures that date range values persist across pages

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve stored date range values
  const startDate = localStorage.getItem('start_date');
  const endDate = localStorage.getItem('end_date');

  // Populate date range fields if values exist
  if (startDate) {
    const startDateField = document.getElementById('start_date');
    if (startDateField) startDateField.value = startDate;
  }

  if (endDate) {
    const endDateField = document.getElementById('end_date');
    if (endDateField) endDateField.value = endDate;
  }

  // Save new values to localStorage on change
  const startDateField = document.getElementById('start_date');
  if (startDateField) {
    startDateField.addEventListener('change', (e) => {
      localStorage.setItem('start_date', e.target.value);
    });
  }

  const endDateField = document.getElementById('end_date');
  if (endDateField) {
    endDateField.addEventListener('change', (e) => {
      localStorage.setItem('end_date', e.target.value);
    });
  }
});