document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileLabelText = document.getElementById('fileLabelText');
    const fileNameDiv = document.getElementById('fileName');

    // Handle file selection change
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length) {
            fileLabelText.textContent = 'Change file';
            fileNameDiv.textContent = fileInput.files[0].name;
        } else {
            fileLabelText.textContent = 'Click to select a file';
            fileNameDiv.textContent = '';
        }
    });

    // Handle form submission
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) return;
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        const resultDiv = document.getElementById('result');
        
        resultDiv.textContent = 'Uploading...';
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            resultDiv.textContent = data.content || 'No content returned.';
        } catch (err) {
            console.error('Upload error:', err);
            resultDiv.textContent = 'Error uploading file.';
        }
    });
});