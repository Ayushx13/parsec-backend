import cron from 'node-cron';
import OrderHistory from '../models/orderHistory.js';
import AccommodationBooking from '../models/accommodationBooking.js';

/**
 * Scheduled cleanup job to delete expired unpaid bookings/orders
 * Runs every 5 minutes to check for expired documents
 * Using .deleteOne() method to trigger pre('deleteOne') middleware for inventory/availability restoration
 */

const cleanupExpiredOrders = async () => {
    try {
        const now = new Date();
        
        // Find all unpaid orders that have expired
        const expiredOrders = await OrderHistory.find({
            paymentMade: 'unpaid',
            expiresAt: { $lte: now }
        });

        if (expiredOrders.length === 0) {
            return;
        }

        console.log(`📦 Found ${expiredOrders.length} expired unpaid orders`);

        // Delete each order using .deleteOne() to trigger middleware
        for (const order of expiredOrders) {
            await order.deleteOne(); // Triggers pre('deleteOne') middleware → restores inventory
            console.log(`   ✅ Deleted order ${order._id} and restored inventory`);
        }

        console.log(`✅ Successfully cleaned up ${expiredOrders.length} expired orders`);
    } catch (error) {
        console.error('❌ Error cleaning up expired orders:', error.message);
    }
};

const cleanupExpiredBookings = async () => {
    try {
        const now = new Date();
        
        // Find all unpaid bookings that have expired
        const expiredBookings = await AccommodationBooking.find({
            paymentMade: 'unpaid',
            expiresAt: { $lte: now }
        });

        if (expiredBookings.length === 0) {
            return;
        }

        console.log(`🏨 Found ${expiredBookings.length} expired unpaid bookings`);

        // Delete each booking using .deleteOne() to trigger middleware
        for (const booking of expiredBookings) {
            await booking.deleteOne(); // Triggers pre('deleteOne') middleware → restores availability
            console.log(`   ✅ Deleted booking ${booking._id} and restored availability`);
        }

        console.log(`✅ Successfully cleaned up ${expiredBookings.length} expired bookings`);
    } catch (error) {
        console.error('❌ Error cleaning up expired bookings:', error.message);
    }
};

/**
 * Main cleanup function that runs both cleanup tasks
 */
const runCleanup = async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n🧹 Running cleanup job at ${timestamp}`);
    
    await cleanupExpiredOrders();
    await cleanupExpiredBookings();
    
    console.log('✨ Cleanup job completed\n');
};

/**
 * Start the scheduled cleanup job
 * Runs every 5 minutes to check for expired bookings/orders
 */
export const startCleanupJob = () => {
    console.log('🕐 Cleanup job scheduled - running every 5 minutes');
    console.log('⏰ Unpaid bookings/orders will be deleted 5 minutes after creation');
    console.log('📊 Inventory and availability will be automatically restored\n');
    
    // Schedule the job to run every 5 minutes
    cron.schedule('*/5 * * * *', runCleanup);
    
    // Optional: Run cleanup immediately on startup to clear any expired during downtime
    console.log('🚀 Running initial cleanup...');
    runCleanup();
};

export default startCleanupJob;
