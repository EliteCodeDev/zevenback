'use strict';

/**
 * withdraw service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::withdraw.withdraw');
