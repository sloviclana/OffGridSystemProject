import axios from "axios";

const API_KEY = 'a9499caca355ee647c55a906ad8340fa';
const API_BASE_URL = "http://localhost:5004";

export const fetchWeatherData = async (lat, lon) => {
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric', // Use 'imperial' for Fahrenheit
    },
  });
  return response.data;
};

export const setPanelOnLocation = async (locationData) => {
  try {
      const response = await axios.post(`${API_BASE_URL}/panels/setPanelOnLocation`, JSON.stringify(locationData),
      {
        headers: {
        "Content-Type": "application/json",
        }
      }
    );
      return response.data;
    } catch (error) {
      console.error('Error submitting panel location:', error);
      throw error;
    }
};