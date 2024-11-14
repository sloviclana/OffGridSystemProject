// src/Components/Map.jsx
import React, { useState } from 'react';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Ovo može biti potrebno za ispravan prikaz ikona sa Leaflet-om u React okruženju
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Map = ({ onLocationSelect }) => {

  const [selectedLocation, setSelectedLocation] = useState(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setSelectedLocation({ lat, lng });
          onLocationSelect({ lng, lat }); // Pravilni redosled za MongoDB
        } else {
          console.error("Coordinates (lat, lng) are out of bounds.");
        }

      },
    });

    return selectedLocation ? <Marker position={selectedLocation} /> : null;
  };

  return (
    <div className='mapDiv'>
      <MapContainer
        center={[45.2671, 19.8335]} // Inicijalni centar mape
        zoom={8}
        style={{ width: '100%', height: '800px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );

};

export default Map;
