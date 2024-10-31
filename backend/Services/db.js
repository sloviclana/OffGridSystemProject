import mongoose from 'mongoose';

// Funkcija za povezivanje s MongoDB bazom
const connectDB = async (MONGODB_URI) => {
  try {
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000 
    });
    console.log('MongoDB Connected');

  } catch (err) {
    console.error(`Greška pri povezivanju s MongoDB: ${err.message}`);
    process.exit(1); // Zaustavlja proces ako dođe do greške
  }
};

export default connectDB;