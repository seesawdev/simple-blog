/*
 * https://github.com/5orenso
 *
 * Copyright (c) 2019 Øistein Sørensen
 * Licensed under the MIT license.
 */
'use strict';

const { routeName, routePath, run, webUtil, utilHtml } = require('../../middleware/init')({ __filename, __dirname });
const Article = require('../../../lib/class/article');

module.exports = async (req, res) => {
    const { hrstart, runId }  = run(req);

    const art = new Article();

    let query = {
        id: req.params.id,
    };

    let apiContent;
    if (query.id) {
        const data = webUtil.cleanObject(req.body, { nullIsUndefined: true });

        apiContent = await art.save(data);
        return utilHtml.renderApi(req, res, 202, apiContent);
    }
    utilHtml.renderApi(req, res, 404, {
        params: req.params,
        error: 'Article not found',
    });
};
