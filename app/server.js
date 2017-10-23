/*
 * https://github.com/5orenso
 *
 * Copyright (c) 2014 Øistein Sørensen
 * Licensed under the MIT license.
 */

'use strict';

const _ = require('underscore');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const commander = require('commander');
const fileUpload = require('express-fileupload');
const Logger = require('../lib/logger');
const LocalUtil = require('../lib/local-util');

const logger = new Logger({
    workerId: 1, // cluster.worker.id
});
const localUtil = new LocalUtil();
const cookieMaxAgeSession = (30 * 86400 * 1000);

const app = express();

commander
    .option('-c, --config <file>', 'configuration file path', './config/config.js')
    .parse(process.argv);

// eslint-disable-next-line
const config = require(commander.config);
if (config) {
    if (_.isObject(config) && _.isObject(config.log)) {
        logger.set('log', config.log);
    }
}

app.use(bodyParser.json());
app.use(compression({
    threshold: 512,
}));
app.use(session({
    name: 'server-session-cookie-id',
    secret: 'mAke noDE.js gREat again!',
    resave: true,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: cookieMaxAgeSession,
    },
    store: new FileStore(),
}));
app.use(fileUpload());

// Include route handlers ------------------------
const rssRouter = require('./routes/rss');

rssRouter.setConfig(config, {
    workerId: 1, // cluster.worker.id,
});
const apiRouter = require('./routes/api');

apiRouter.setConfig(config, {
    workerId: 1, // cluster.worker.id,
});
const webRouter = require('./routes/web');

webRouter.setConfig(config, {
    workerId: 1, // cluster.worker.id,
});
const imageRouter = require('./routes/image');

imageRouter.setConfig(config, {
    workerId: 1, // cluster.worker.id,
    photoPath: config.adapter.markdown.photoPath,
    photoCachePath: config.blog.domain,
});
const searchRouter = require('./routes/search');

searchRouter.setConfig(config, {
    workerId: 1, // cluster.worker.id,
});

// Register routes -------------------------------
app.use('/api', apiRouter);
app.use('/rss', rssRouter);
app.use('/static', localUtil.setCacheHeaders);
app.use('/static', express.static(config.blog.staticFilesPath));
app.use('/.well-known/', express.static(config.blog.textFilesPath));
app.use('/pho/', imageRouter);
app.use('/search/', searchRouter);

app.use('/', webRouter);

// Start the server ------------------------------
const server = app.listen(config.app.port, () => {
    const host = server.address().address;
    const port = server.address().port;
    logger.log('info', `Something happens at http://${host}:${port}/`);
    // heapdump / inspecting for memory leaks.
    // console.log('$ kill -USR2 ' + process.pid + ' && curl http://localhost:8080/tech/_test_col && ' +
    //    'curl http://localhost:8080/gc && curl http://localhost:8080/gc');
});
