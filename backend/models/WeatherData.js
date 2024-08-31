import mongoose, { Schema } from 'mongoose';

const WeatherDataSchema = new mongoose.Schema ({
    
    location: {
        type: String,
        required: true
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true 
    }, 

    temperature: {
        type: Number,
        required: true
    }, 

    cloudiness: {
        type: Number,
        required: true
    },

    sunset: {
        type: Date,
        required: true
    },

    sunrise: {
        type: Date,
        required: true
    },

    rain: {
        type: Number,
        required: true
    },

    systemId: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

const WeatherDataModel = mongoose.model('weatherData', WeatherDataSchema);
export default WeatherDataModel;

