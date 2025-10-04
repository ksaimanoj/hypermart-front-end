require('dotenv').config();
const express = require('express');

const path = require('path');
const routes = require('./routes/index');

const app = express();
app.use('/views', express.static(path.join(__dirname, 'views')));
const PORT = process.env.PORT || 3000;

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});