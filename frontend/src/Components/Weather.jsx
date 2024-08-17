// src/Components/HomePage.jsx
import React, { useState } from 'react';
import Map from './Map';
import { fetchWeatherData, setPanelOnLocation } from '../Services/WeatherService';
import { useNavigate } from 'react-router-dom';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cloudiness, setCloudiness] = useState(null);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  const handleLocationSelect = async (location) => {
    setLocation(location);
    const data = await fetchWeatherData(location.lat, location.lng);
    setWeatherData(data);
    setCloudiness(data.clouds.all);
  };

  const handleSubmit = async(e) => {
    
    e.preventDefault();
    if (!location || !weatherData) {
        alert("Please select a location first.");
        return;
      }

    const user = JSON.parse(sessionStorage.getItem('user'));

    const panelData = {
        locationLat: location.lat,
        locationLng: location.lng,
        locationName: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        cloudiness: cloudiness,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        rain: weatherData.rain ? weatherData.rain['1h'] : 0,
        user: user.email
      };

      try {
        const result = await setPanelOnLocation(panelData);
        console.log('Panel created successfully!', result);
        alert('Panel created successfully:', result);
        navigate('/userDashboard');

      } catch (error) {
        console.error('Error submitting location:', error);
      }

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
          <br></br>
          <p><strong>Is this the correct location where you want to place the panel? If not, pick another location on the map.</strong></p>
          <form onSubmit={handleSubmit}>
          <button type='submit' className='primaryBtn'>Place the panel and battery here</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
