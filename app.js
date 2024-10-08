const express = require('express');
const cors = require('cors');

const clientRoutes = require('./routes/clientRoutes');
const loginRoutes = require('./routes/loginRoutes');
const newClientRoutes = require('./routes/newClientRoutes');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// Use the client routes
app.use('/api', clientRoutes);

// Use the login routes
app.use('/api', loginRoutes);

// Use the new client routes
app.use('/api', newClientRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to Pitamaas Backend');
})

// post request
app.post('/pitamaas', (req, res) => {
    console.log(req.body);
    res.send('Welcome to Pitamaas Backend');
})

// Define a port and start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
