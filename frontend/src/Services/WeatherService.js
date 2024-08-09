import axios from "axios";

const API_KEY = 'a9499caca355ee647c55a906ad8340fa';

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