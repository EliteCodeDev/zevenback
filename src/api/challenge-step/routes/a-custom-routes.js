'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/challenge-steps/create-with-relations',
      handler: 'challenge-step.createWithRelations',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/challenge-steps/:documentId/update-with-relations',
      handler: 'challenge-step.updateWithRelations',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/challenge-steps/get-all-data',
      handler: 'challenge-step.getAllData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/challenge-steps/:documentId/get-all-data',
      handler: 'challenge-step.getAllData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};