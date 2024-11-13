import express from 'express';
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import cors from 'cors';
import weatherDataRoutes from './weatherDataRoutes.js';
import connectDB from '../db.js';

const app = express();
const PORT = 5009;
const MONGODB_URI = "mongodb+srv://sloviclana:myOffGridDB@offgridcluster.xu5ndiy.mongodb.net/weatherData-db?retryWrites=true&w=majority&appName=OffGridCluster";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/weather', weatherDataRoutes);

connectDB(MONGODB_URI).then(() => {
  // Pokretanje servera nakon uspešnog povezivanja sa bazom
  app.listen(PORT, () => {
    console.log(`WeatherDataService radi na portu ${PORT}`);
  });
}).catch((error) => {
  console.log(`Greška prilikom povezivanja sa bazom: ${error}`);
});



