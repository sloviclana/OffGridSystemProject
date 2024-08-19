import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import panelRoutes from './routes/panelRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

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

            app.listen(5000, () => {console.log("server started on port 5000") });
        })
        
    } catch (error) {
        console.error(error);
    }
}

connect();




