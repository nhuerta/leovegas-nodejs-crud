const log4js = require('log4js');
const jsonLayout = require('log4js-json-layout');

// Configure the logger
log4js.addLayout('json', jsonLayout);
log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: { type: 'json' }
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' }
    },
});

// Create and export the logger instance
const logger = log4js.getLogger();
logger.level = 'info';

module.exports = logger;