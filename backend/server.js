const express = require('express')
const mongoose = require('mongoose')
const app = express()

const uri = "mongodb+srv://sloviclana:myOffGridDB@offgridcluster.xu5ndiy.mongodb.net/?retryWrites=true&w=majority&appName=OffGridCluster"

async function connect() {
    try {
        await mongoose.connect(uri).then(() => {
            console.log("Connected to MongoDB");

            app.listen(5000, () => {console.log("server started on posrt 5000") });
        })
        
    } catch (error) {
        console.error(error);
    }
}

connect();




