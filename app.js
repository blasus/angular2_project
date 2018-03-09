const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      passport = require('passport'),
      mongoose = require('mongoose'),
      database = require('./config/database');

// Connect to Database
mongoose.connect(database.path);

var db = mongoose.connection;

// On Connection
db.on('connected', () => {
    console.log('Connected to database: ', database.path);
});

// On error
db.on('error', (err) => {
    console.error('Database error: ', err);
});

// Initialize the express application
const app = express();

// Import user Middleware
const users = require('./routes/users');

// Set a port number
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/users', users);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Index Route
app.get('/', (req, res) => {
    console.error('Invalid Endpoint'); 
    res.status(400).send('Invalid Endpoint');
});

// Every route specified goes into this one and it prints the result into the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start Server
app.listen(port, () => {
    console.log('Server started on port', port);
});
