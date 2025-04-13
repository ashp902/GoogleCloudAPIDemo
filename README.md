# Google Cloud Vision API Demo

This is a full-stack web application that demonstrates the use of Google Cloud Vision API to detect labels in uploaded images. The application is built with Node.js and Express, and can be deployed to Google App Engine.

## Features

- Upload images through a web interface
- Process images using Google Cloud Vision API
- Display detected labels with confidence scores
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Google Cloud Platform account
- Google Cloud Vision API enabled
- Google Cloud SDK (for deployment)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd vision-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Google Cloud Vision API credentials

1. Create a Google Cloud Platform project
2. Enable the Cloud Vision API
3. Create a service account with the "Cloud Vision API User" role
4. Create a key for the service account (JSON format)
5. Extract the necessary information from the JSON file for your environment variables

### 4. Configure environment variables

Create a `.env` file in the project root with the following content:

```
# Google Cloud credentials (extract these from your service account key file)
GCP_PROJECT_ID=your-project-id
GCP_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
GCP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key content with \n for line breaks\n-----END PRIVATE KEY-----

# Server port
PORT=3000
```

**Important Notes about the Private Key:**

- When copying the private key from your JSON file, replace all newline characters (`\n`) with the string `\n`
- Make sure to include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- If you're having issues with the private key format, you can use the alternative method with the key file path:
  ```
  GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/credentials.json
  ```

## Running Locally

Start the development server:

```bash
npm run dev
```

## Project Structure

```
vision-app/
├── server.js           # Main Express server
├── package.json        # Project dependencies and scripts
├── app.yaml            # Google App Engine configuration
├── .env                # Environment variables (local development)
├── .gcloudignore       # Files to exclude from deployment
├── views/
│   └── result.ejs      # EJS template for results page
├── public/
│   └── index.html      # Main HTML page with upload form
└── uploads/            # Directory for storing uploaded images
```

## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Results Page
![Results Page](screenshots/results.png)

