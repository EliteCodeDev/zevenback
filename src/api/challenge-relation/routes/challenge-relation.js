'use strict';

/**
 * src/api/challenge-relation/routes/challenge-relation.js
 * challenge-relation router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::challenge-relation.challenge-relation',{
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
