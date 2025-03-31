// src/api/challenge-relation/routes/custom-routes.js
'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/challenge-relations/:documentId/update-with-relations',
      handler: 'challenge-relation.updateWithRelations',
      config: {
        policies: [],
      },
    },
  ],
};