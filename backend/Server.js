const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('../backend/router/router');


const app = express();
const port = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your React frontend
    credentials: true, // Allow cookies and headers like Authorization
  })
);
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

app.use('/', router);


// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
