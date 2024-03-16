const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define mongoose schema and model for Weather data
const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  description: String,
  timestamp: { type: Date, default: Date.now }
});
const Weather = mongoose.model('Weather', weatherSchema);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Handler for /weather endpoint
app.get('/weather', async (req, res) => {
  try {
    // Fetch weather data from OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city ='York'; // Default city
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(apiUrl);
    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description
    };

    // Save weather data to MongoDB
    const newWeather = new Weather(weatherData);
    await newWeather.save();

    // Return the saved weather data
    res.json(newWeather);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
