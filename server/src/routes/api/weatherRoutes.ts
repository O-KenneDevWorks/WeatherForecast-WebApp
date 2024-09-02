import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';
import HistoryService from '../../service/historyService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  // TODO: GET weather data from city name
  console.log(req.body)
  const { cityName } = req.body;
  console.log("City: " + cityName)

  if (!cityName) {
    res.status(400).json({ error: 'City name must be provided' });
    return;
  }

  try {
    // Get weather data for the provided city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    console.log("Time to add city")
    await HistoryService.addCity(cityName)

    // Send the weather data as a JSON response
    res.json(weatherData);
    
    // TODO: Save city to search history
  }  catch (error) {
    if (error instanceof Error) {
      console.error('Error getting weather data:', error.message);
    res.status(500).json({ error: error.message });
    } else {
      console.error('Unexpected error:', error);
    }
    throw error; // or return a default value or message
  }
  
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    console.log(req.params['id']);
    
    // Attempt to remove the city by ID
    await HistoryService.removeCity(req.params['id']);
    
    // If the city is removed successfully, send a 200 status code
    res.status(200).json({ message: 'City successfully deleted' });
  } catch (error) {
    console.error('Error deleting city:', error);

    // If an error occurs, send a 500 status code
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to delete city', error: error.message });
    } else {
      res.status(500).json({ message: 'Failed to delete city due to an unknown error' });
    }
  }
});

export default router;
