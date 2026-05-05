const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env file");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));
}

// Basic Route
app.get('/', (req, res) => {
    res.send('ANSH Design Studio API is running...');
});

// Import Routes
const teamRoutes = require('./routes/team');
const uploadRoutes = require('./routes/upload');
const projectRoutes = require('./routes/projects');
app.use('/api/team', teamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
