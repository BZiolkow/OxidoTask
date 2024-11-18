document.getElementById('processButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const responseText = document.getElementById('responseText');

  if (!fileInput.files[0]) {
    responseText.textContent = 'Please upload a text file.';
    return;
  }

  responseText.textContent = 'Processing...';
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const fileContent = reader.result;

    try {
      const response = await fetch('http://localhost:3000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with the server');
      }

      const data = await response.json();
      responseText.textContent = data;
    } catch (error) {
      responseText.textContent = `Error: ${error.message}`;
    }
  };

  reader.onerror = () => {
    responseText.textContent = 'Error reading the file.';
  };

  reader.readAsText(file);
});