require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');

// Import the URL routes
const urlRoutes = require('./routes/urlRoutes');

// Initialize the Express app
const app = express();

// Load Swagger definition
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors({ origin: '*' })); // Adjust origin as needed

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use the URL routes
app.use('/api', urlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
module.exports = app; // Export the app instance for testing