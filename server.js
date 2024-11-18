const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

const readPromptFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'prompt.txt'), 'utf8', (err, data) => {
      if (err) {
        reject('Error reading prompt file');
      } else {
        resolve(data);
      }
    });
  });
};

app.post('/process-text', async (req, res) => {
  const { fileContent } = req.body;

  if (!fileContent) {
    return res.status(400).json({ error: 'Missing file content' });
  }

  try {
    const promptText = await readPromptFile();

    const combinedContent = `${promptText}\n\n${fileContent}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: combinedContent },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});