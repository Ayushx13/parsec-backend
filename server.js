import "./config.js";
import mongoose from 'mongoose';
import { app } from './app.js';
import { initializeHouses } from './controllers/sortingHatController.js';
import { exportAllCollectionsToCSV } from './exportToCSV.js';
import { startCleanupJob } from './utils/cleanupExpiredBookings.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(async con => {
    console.log('Connection Successful !! 🎉');
    
    // Initialize houses on startup
    await initializeHouses();
    console.log('🏰 Houses initialized');
    
    // Export database on server startup
    await exportAllCollectionsToCSV();
    
    // Start cleanup job for expired bookings/orders
    startCleanupJob();
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on port, ${PORT}`);
    //lataksh gay
});