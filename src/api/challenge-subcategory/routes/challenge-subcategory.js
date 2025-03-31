'use strict';

/**
 * challenge-subcategory router
 */

/*
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::challenge-subcategory.challenge-subcategory');
*/

/*
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::challenge-subcategory.challenge-subcategory', {
  config: {
    updateWithRelations: {
      policies: [],
      middlewares: [],
    },
  },
  routes: [
    {
      method: 'PUT',
      path: '/challenge-subcategories/:documentId/update-with-relations',
      handler: 'challenge-subcategory.updateWithRelations',
      config: {
        policies: [],
      },
    },
  ],
});
*/

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::challenge-subcategory.challenge-subcategory', {
  config: {
    find: {
      policies: [],
      middlewares: [],
    },
    findOne: {
      policies: [],
      middlewares: [],
    },
    create: {
      policies: [],
      middlewares: [],
    },
    update: {
      policies: [],
      middlewares: [],
    },
    delete: {
      policies: [],
      middlewares: [],
    },
  },
  routes: require('./custom-routes').routes, // Importa las rutas personalizadas
});