'use strict';

/**
 * challenge-subcategory controller
 */

/*
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::challenge-subcategory.challenge-subcategory');
*/

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::challenge-subcategory.challenge-subcategory', ({ strapi }) => ({
  async updateWithRelations(ctx) {
    const { documentId } = ctx.params; // Obtener el ID de la subcategoría desde la URL
    const { name, leverage } = ctx.request.body.data; // Obtener los datos del cuerpo de la petición

    // Buscar la subcategoría por su ID
    const subcategory = await strapi.service('api::challenge-subcategory.challenge-subcategory').findOne(documentId, {
      populate: { challenge_relations_stage: true }, // Incluir la relación
    });

    if (!subcategory) {
      return ctx.notFound('Subcategoría no encontrada');
    }

    // Actualizar el name de la subcategoría
    const updatedSubcategory = await strapi.service('api::challenge-subcategory.challenge-subcategory').update(documentId, {
      data: { name },
    });

    // Si hay un ChallengeRelationsStage relacionado, actualizar su leverage
    if (subcategory.challenge_relations_stage) {
      const relationsStageId = subcategory.challenge_relations_stage.documentId;
      await strapi.service('api::challenge-relations-stage.challenge-relations-stage').update(relationsStageId, {
        data: { leverage },
      });
    }

    // Devolver la subcategoría actualizada
    return updatedSubcategory;
  },
}));