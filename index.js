const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const housekeepingTaskRoutes = require('./routes/housekeepingTaskRoutes');
const maintenanceRequestRoutes = require('./routes/maintenanceRequestRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const serviceCatalogRoutes = require('./routes/serviceCatalogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const contactUsRoutes = require('./routes/contactUsRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/housekeeping', housekeepingTaskRoutes);
app.use('/api/maintenance', maintenanceRequestRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/services', serviceRequestRoutes);
app.use('/api/service-catalog', serviceCatalogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/contact', contactUsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LuxuryStay Hospitality API' });
});

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
