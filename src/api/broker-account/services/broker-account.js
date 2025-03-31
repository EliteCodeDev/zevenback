'use strict';

/**
 * broker-account service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::broker-account.broker-account');
