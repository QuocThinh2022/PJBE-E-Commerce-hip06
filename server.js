const express = require('express');
const initRoutes = require('./routes/index.route');
require('dotenv').config();
const dbConnect = require('./config/dbconnect');

const app = express();
const port = process.env.PORT ||8080;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
dbConnect();
initRoutes(app);

app.use('/', (req, res) => {
    res.send('server onnnn!');
});

app.listen(port, () => {
    console.log('Server running on the port: ' + port);
})