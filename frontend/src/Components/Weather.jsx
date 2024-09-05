// src/Components/HomePage.jsx
import React, { useState } from 'react';
import Map from './Map';
import { fetchWeatherData, setPanelOnLocation } from '../Services/WeatherService';
import { useNavigate } from 'react-router-dom';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cloudiness, setCloudiness] = useState(null);
  const [location, setLocation] = useState(null);
  const [installedPower, setInstalledPower] = useState(null);
  const [formData, setFormData] = useState({
    installedPower: null,
    capacity: null,
    power: null,
    chargingDuration: 0, 
    dischargingDuration: 0
  });
  const navigate = useNavigate();

  const handleLocationSelect = async (location) => {
    setLocation(location);
    const data = await fetchWeatherData(location.lat, location.lng);
    setWeatherData(data);
    setCloudiness(data.clouds.all);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

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
        user: user.email,
        installedPower: formData.installedPower,
        capacity: formData.capacity,
        power: formData.power,
        chargingDuration: formData.capacity / formData.power,
        dischargingDuration: formData.capacity / formData.power
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
      <div>
        <h1 className='title1'>Location picker for your new panel</h1>
      </div>
      <div className='mapContainerDiv'>
      
      <Map onLocationSelect={handleLocationSelect} />
      {weatherData && (
        <div className='locationDiv'>
            <div className='locationComponentDiv'>
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
          <p className='warningParagraph'>Is this the correct location where you want to place the panel? If not, pick another location on the map. If it is, please enter installed power for the panel, and battery info:</p>
          <form onSubmit={handleSubmit}>
            <label>Installed power of the panel (kW) </label>
            <input 
            type='number'
            id="installedPower" 
            name="installedPower" 
            value={formData.installedPower} 
            onChange={handleChange} 
            required
            ></input>

            <h3>Battery info: </h3>
            <label>Capacity:</label>
            <input 
            type='number'
            id="capacity" 
            name="capacity" 
            value={formData.capacity} 
            onChange={handleChange} 
            required
            ></input> <br></br>

            <label htmlFor="power">Power: </label>
            <input type='number'
            id="power" 
            name="power" 
            value={formData.power} 
            onChange={handleChange} 
            required
            ></input> <br></br>

          <button type='submit' className='primaryBtn'>Place the panel and battery here</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
};

export default Weather;
