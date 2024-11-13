import express from 'express';
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import cors from 'cors';
import historyDataRoutes from './historyDataRoutes.js';
import HistoryDataService from './HistoryDataService.js';
import connectDB from '../db.js';
import cron from 'node-cron';

const app = express();
const PORT = 5008;
const MONGODB_URI = "mongodb+srv://sloviclana:myOffGridDB@offgridcluster.xu5ndiy.mongodb.net/test?retryWrites=true&w=majority&appName=OffGridCluster";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/historyData', historyDataRoutes);

connectDB(MONGODB_URI).then(() => {
  // Pokretanje servera nakon uspešnog povezivanja sa bazom
  app.listen(PORT, () => {
    console.log(`HistoryDataService radi na portu ${PORT}`);


    cron.schedule('0 * * * *', () => {
      try {
        HistoryDataService.updateWeatherDataForAllSystems();
        console.log('Running cron job: updateWeatherDataForAllSystems');
      } catch (error) {
        console.error('Error running cron job:', error);
      }
  });
  });
}).catch((error) => {
  console.log(`Greška prilikom povezivanja sa bazom: ${error}`);
});



