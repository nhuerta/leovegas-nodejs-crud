const logger = require('./logger');
const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');

logger.info('Starting application');
const app = express();
app.use(bodyParser.json());
app.use('/users', usersRouter);
app.listen(3000, () => {
    logger.info('Server is running on port 3000');
});

module.exports = app;
