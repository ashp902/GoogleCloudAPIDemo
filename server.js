// Import required dependencies
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const vision = require('@google-cloud/vision');

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Initialize Google Cloud Vision client
// This provides multiple ways to authenticate:
// 1. Using GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Using a specified keyFilename
// 3. Using credentials passed directly

let visionClientOptions = {};

// If a specific key file is provided in .env, use that
if (process.env.GOOGLE_CLOUD_KEYFILE) {
  visionClientOptions.keyFilename = process.env.GOOGLE_CLOUD_KEYFILE;
}

// For demo purposes, we'll create a mock client for local testing
// This will allow the app to run without real credentials
let visionClient;
let usingMockClient = false;

try {
  visionClient = new vision.ImageAnnotatorClient(visionClientOptions);
  console.log('Vision API client initialized with options:',
    Object.keys(visionClientOptions).length ? visionClientOptions : 'default credentials');
} catch (error) {
  console.warn('Failed to initialize real Vision API client:', error.message);
  console.warn('Using mock Vision API client for demo purposes');

  // Create a mock client that returns sample data
  usingMockClient = true;
  visionClient = {
    labelDetection: async () => {
      return [{
        labelAnnotations: [
          { description: 'Sample label 1', score: 0.95 },
          { description: 'Sample label 2', score: 0.85 },
          { description: 'Sample label 3', score: 0.75 },
          { description: 'Sample label 4', score: 0.65 },
          { description: 'Sample label 5', score: 0.55 }
        ]
      }];
    }
  };
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send('No image file uploaded.');
    }

    const imagePath = req.file.path;

    // Add a note if we're using the mock client
    if (usingMockClient) {
      console.log('Using mock Vision API client for this request');
    }

    // Perform label detection on the uploaded image
    const [result] = await visionClient.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    // Render the results page
    res.render('result', {
      imageUrl: `/${imagePath}`,
      labels: labels,
      usingMockClient: usingMockClient
    });

  } catch (error) {
    console.error('Error analyzing image:', error);

    // If there's an error and we're not already using the mock client,
    // fall back to mock data
    if (!usingMockClient) {
      console.warn('Falling back to mock data due to error');
      const mockLabels = [
        { description: 'Error Fallback 1', score: 0.95 },
        { description: 'Error Fallback 2', score: 0.85 },
        { description: 'Error Fallback 3', score: 0.75 }
      ];

      return res.render('result', {
        imageUrl: `/${imagePath}`,
        labels: mockLabels,
        usingMockClient: true,
        errorMessage: `Note: Using mock data due to error: ${error.message}`
      });
    }

    res.status(500).send(`Error analyzing image: ${error.message}`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something broke! Error: ${err.message}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

  // Ensure uploads directory exists
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    console.log('Created uploads directory');
  }
});
