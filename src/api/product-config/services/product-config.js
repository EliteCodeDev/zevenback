'use strict';

/**
 * product-config service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product-config.product-config');
