// src/Components/HomePage.jsx
import React, { useState } from 'react';
import Map from './Map';
import { fetchWeatherData } from '../Services/WeatherService';
import L from 'leaflet';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cloudiness, setCloudiness] = useState(null);
  const [location, setLocation] = useState(null);

  const handleLocationSelect = async (location) => {
    setLocation(location);
    const data = await fetchWeatherData(location.lat, location.lng);
    setWeatherData(data);
    setCloudiness(data.clouds.all);
  };

  return (
    <div>
      <h1>Location picker for your new panel</h1>
      <Map onLocationSelect={handleLocationSelect} />
      {weatherData && (
        <div className='centralDiv'>
            <div className='centralComponentDiv'>
          <h2>Weather Information</h2>
          <p><strong>Location:</strong> {weatherData.name}</p>
          <p><strong>Latitude: </strong> {location.lat} </p>
          <p><strong>Longitude: </strong> {location.lng} </p>
          <p><strong>Temperature:</strong> {weatherData.main.temp} °C</p>
          <p><strong>Weather:</strong> {weatherData.weather[0].description}</p>
          {cloudiness !== null ? (<p><strong>Cloudiness:</strong> {cloudiness}%</p>) : (<p>Loading...</p>)}
          <p><strong>Sunrise:</strong> {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
          <p><strong>Sunset:</strong> {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
          <p><strong>Rain:</strong> {weatherData.rain ? weatherData.rain['1h'] : '0 mm'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
