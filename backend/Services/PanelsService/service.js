import express from 'express';
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import cors from 'cors';
import panelsRoutes from './panelRoutes.js';
import connectDB from '../db.js';

const app = express();
const PORT = 5004;
const MONGODB_URI = "mongodb+srv://sloviclana:myOffGridDB@offgridcluster.xu5ndiy.mongodb.net/panels-db?retryWrites=true&w=majority&appName=OffGridCluster";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/panels', panelsRoutes);

connectDB(MONGODB_URI).then(() => {
  // Pokretanje servera nakon uspešnog povezivanja sa bazom
  app.listen(PORT, () => {
    console.log(`PanelsService radi na portu ${PORT}`);
  });
}).catch((error) => {
  console.log(`Greška prilikom povezivanja sa bazom: ${error}`);
});



