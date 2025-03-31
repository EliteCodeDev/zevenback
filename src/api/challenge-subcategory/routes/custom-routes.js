'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/challenge-subcategories/:documentId/update-with-relations',
      handler: 'challenge-subcategory.updateWithRelations',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};