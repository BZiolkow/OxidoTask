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

const saveToHTMLFile = (content) => {
  const htmlContent = content;

  const publicDirPath = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDirPath)) {
    fs.mkdirSync(publicDirPath);
  }

  const filePath = path.join(publicDirPath, 'artykul.html');
  fs.writeFile(filePath, htmlContent, (err) => {
    if (err) {
      console.error('Error writing HTML file:', err);
    } else {
      console.log(`HTML file saved as artykul.html in the 'public' folder.`);
    }
  });
};
const mergeHTMLFiles = () => {
  const templateFilePath = path.join(__dirname, 'public', 'szablon.html');
  const articleFilePath = path.join(__dirname, 'public', 'artykul.html');
  const outputFilePath = path.join(__dirname, 'public', 'podglad.html');

  try {

    const templateContent = fs.readFileSync(templateFilePath, 'utf-8');


    const articleContent = fs.readFileSync(articleFilePath, 'utf-8');


    const combinedContent = templateContent.replace(
      '<body>',
      `<body>\n${articleContent}`
    );


    fs.writeFileSync(outputFilePath, combinedContent, 'utf-8');
    console.log('File podglad.htm has been created successfully in the public folder.');
  } catch (error) {
    console.error('Error merging HTML files:', error.message);
  }
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

    const generatedContent = response.data.choices[0].message.content;

    saveToHTMLFile(generatedContent);
    mergeHTMLFiles();

    res.json({ message: 'Article saved as artykul.html in the public folder.' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
