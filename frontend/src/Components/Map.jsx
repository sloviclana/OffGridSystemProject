// src/Components/Map.jsx
import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const Map = ({ onLocationSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCFXlcRxP4FJO9df5kfiA7bs2d85yysgvM',
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 45.2671, lng: 19.8335 }); // Inicijalni centar mape

  const handleMapClick = (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setSelectedLocation({ lat, lng });
    setMapCenter(latLng); // Postavi centar mape na lokaciju markera
    onLocationSelect({ lat, lng });
  };

  return isLoaded ? (
    <div className='centralDiv'>
    <GoogleMap
      onClick={handleMapClick}
      mapContainerStyle={{ width: '90%', height: '800px' }}
      zoom={8}
      center={mapCenter}
    >
      {selectedLocation && (
        <Marker position={selectedLocation} />
      )}
    </GoogleMap>
    </div>
  ) : (
    <div className='centralDiv'>Loading...</div>
  );
  
};

export default Map;
