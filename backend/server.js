import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import panelRoutes from './routes/panelRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import panelsBatteriesController from './controllers/panelsBatteriesController.js';
import cron from 'node-cron';

const app = express();

const uri = "mongodb+srv://sloviclana:myOffGridDB@offgridcluster.xu5ndiy.mongodb.net/?retryWrites=true&w=majority&appName=OffGridCluster"

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/auth', authRoutes);
app.use('/weather', weatherRoutes);
app.use('/panels', panelRoutes);
app.use('/users', usersRoutes);

async function connect() {
    try {
        await mongoose.connect(uri).then(() => {
            console.log("Connected to MongoDB");

            app.listen(5000, () => {
                console.log("server started on port 5000") 
                /*
                const systemid = 'PanelSystem2';
                const timestamp1 = new Date('2024-08-30T00:00:00Z');
                const timestamp2 = new Date('2024-08-31T23:59:59Z');

                panelsBatteriesController.generateHistoryDataReport(timestamp1, timestamp2, systemid);*/
                //panelsBatteriesController.updateHistoryDataForAllPanelSystems();
                cron.schedule('0 * * * *', () => {
                    try {
                      panelsBatteriesController.updateWeatherDataForAllSystems();
                      console.log('Running cron job: updateWeatherDataForAllSystems');
                    } catch (error) {
                      console.error('Error running cron job:', error);
                    }
                });
            });
        })
        
    } catch (error) {
        console.error(error);
    }
}

connect();




