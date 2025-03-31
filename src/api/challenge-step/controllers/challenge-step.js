'use strict';

/**
 * challenge-step controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::challenge-step.challenge-step', ({ strapi }) => ({
  async createWithRelations(ctx) {
    try {
      // Se extrae la data desde ctx.request.body
      console.log('Data recibida:', ctx.request.body);
      const { name, stages = [], subcategories = [] } = ctx.request.body;

      // Array para almacenar los IDs de los stages creados
      const stageIds = [];

      // Procesamos los stages - SIEMPRE creando uno nuevo
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        // Creamos un nuevo objeto con solo el nombre del stage original
        // y añadimos la propiedad phase basada en su posición
        const newStage = {
          name: stage.name,
          phase: i + 1  // Empezamos desde 1
        };

        console.log('Creando nuevo stage:', newStage);

        // Siempre creamos un nuevo stage
        const stageRecord = await strapi
          .service('api::challenge-stage.challenge-stage')
          .create({ data: newStage });

        console.log('Stage creado:', stageRecord);
        stageIds.push(stageRecord.documentId);
      }

      // Se arma el objeto para crear el challenge-step (sin stages, ya que no es una relación directa)
      const stepData = {
        name
      };

      // Se crea el challenge-step
      const createdStep = await strapi
        .service('api::challenge-step.challenge-step')
        .create({ data: stepData });
      console.log('Challenge Step creado:', createdStep);

      // Procesamos las subcategorías y creamos una relación para cada una, asignándole todos los stages
      for (const subcat of subcategories) {
        let subcatRecord;
        if (subcat.documentId) {
          const existingSubcats = await strapi
            .service('api::challenge-subcategory.challenge-subcategory')
            .find({
              filters: { documentId: subcat.documentId }
            });
          if (existingSubcats?.results?.length) {
            subcatRecord = existingSubcats.results[0];
          } else {
            subcatRecord = await strapi
              .service('api::challenge-subcategory.challenge-subcategory')
              .create({ data: subcat });
          }
        } else {
          subcatRecord = await strapi
            .service('api::challenge-subcategory.challenge-subcategory')
            .create({ data: subcat });
        }
        console.log('Subcat:', subcatRecord);

        // Se crea un registro en Challenge Relations que contenga:
        // - El id de la subcategoría
        // - El id del challenge-step
        // - Todos los stages nuevos creados
        let challengeRelation = await strapi
          .service('api::challenge-relation.challenge-relation')
          .create({
            data: {
              challenge_subcategory: subcatRecord.documentId,
              challenge_step: createdStep.documentId,
              challenge_stages: stageIds
            }
          });
        console.log('Challenge Relation:', challengeRelation);
      }

      ctx.send(createdStep);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async updateWithRelations(ctx) {
    try {
      console.log('Params:', ctx.params);
      const { documentId } = ctx.params;
      console.log('Data recibida:', ctx.request.body);
      const { name, stages = [], subcategories = [] } = ctx.request.body;

      // Buscamos el step existente usando su documentId
      const stepFound = await strapi
        .service('api::challenge-step.challenge-step')
        .find({
          filters: { documentId }
        });

      if (!stepFound || !stepFound.results || stepFound.results.length === 0) {
        return ctx.notFound('Step no encontrado');
      }

      // Tomamos el primer registro encontrado
      const stepRecord = stepFound.results[0];
      console.log('Step encontrado:', stepRecord);

      // Procesamos los stages enviados y construimos un array de stageIds (usando el id interno)
      const stageIds = [];
      for (const stage of stages) {
        let stageRecord;
        if (stage.documentId) {
          console.log('Stage tiene document:', stage.documentId);
          const foundStages = await strapi
            .service('api::challenge-stage.challenge-stage')
            .find({
              filters: { documentId: stage.documentId }
            });
          if (foundStages && foundStages.results && foundStages.results.length > 0) {
            stageRecord = foundStages.results[0];
            console.log('Stage encontrado:', stageRecord);
          } else {
            console.log('Stage nuevo:', stage);
            stageRecord = await strapi
              .service('api::challenge-stage.challenge-stage')
              .create({ data: stage });
            console.log('Stage creado:', stageRecord);
          }
        } else {
          console.log('Stage nuevo (sin documentId):', stage);
          stageRecord = await strapi
            .service('api::challenge-stage.challenge-stage')
            .create({ data: stage });
          console.log('Stage creado:', stageRecord);
        }
        stageIds.push(stageRecord.documentId);
      }
      console.log('Stage IDs procesados:', stageIds);

      // Actualizamos el challenge-step únicamente con el nuevo nombre
      const updatedStep = await strapi
        .service('api::challenge-step.challenge-step')
        .update(stepRecord.documentId, { data: { name } });
      console.log('Challenge Step actualizado:', updatedStep);

      // Procesamos las subcategorías: buscamos o creamos y recolectamos sus ids (usando id interno)
      const newSubcatIds = [];
      const subcatRecords = [];
      for (const subcat of subcategories) {
        let subcatRecord;
        if (subcat.documentId) {
          console.log('Subcategoría tiene document:', subcat.documentId);
          const foundSubcats = await strapi
            .service('api::challenge-subcategory.challenge-subcategory')
            .find({
              filters: { documentId: subcat.documentId }
            });
          if (foundSubcats && foundSubcats.results && foundSubcats.results.length > 0) {
            subcatRecord = foundSubcats.results[0];
            console.log('Subcategoría encontrada:', subcatRecord);
          } else {
            console.log('Subcategoría nueva:', subcat);
            subcatRecord = await strapi
              .service('api::challenge-subcategory.challenge-subcategory')
              .create({ data: subcat });
            console.log('Subcategoría creada:', subcatRecord);
          }
        } else {
          console.log('Subcategoría nueva (sin documentId):', subcat);
          subcatRecord = await strapi
            .service('api::challenge-subcategory.challenge-subcategory')
            .create({ data: subcat });
          console.log('Subcategoría creada:', subcatRecord);
        }
        newSubcatIds.push(subcatRecord.id);
        subcatRecords.push(subcatRecord);
      }
      console.log('Subcategorías procesadas, IDs:', newSubcatIds);

      // Para cada subcategoría enviada, verificamos si ya existe una challenge-relation para este step y actualizamos o creamos la relación
      for (const subcatRecord of subcatRecords) {
        // Buscamos relación existente usando los IDs internos (stepRecord.id y subcatRecord.id)
        const existingRelation = await strapi
          .service('api::challenge-relation.challenge-relation')
          .find({
            filters: {
              challenge_step: stepRecord.id,
              challenge_subcategory: subcatRecord.id
            }
          });
        if (existingRelation && existingRelation.results && existingRelation.results.length > 0) {
          const relationRecord = existingRelation.results[0];
          console.log('Challenge Relation existente encontrada:', relationRecord);
          const updatedRelation = await strapi
            .service('api::challenge-relation.challenge-relation')
            .update(relationRecord.documentId, {
              data: { challenge_stages: stageIds }
            });
          console.log('Challenge Relation actualizada:', updatedRelation);
        } else {
          console.log('Creando nueva Challenge Relation para subcategoría:', subcatRecord.id);
          const newRelation = await strapi
            .service('api::challenge-relation.challenge-relation')
            .create({
              data: {
                challenge_subcategory: subcatRecord.id,
                challenge_step: stepRecord.id,
                challenge_stages: stageIds
              }
            });
          console.log('Challenge Relation creada:', newRelation);
        }
      }

      // Deshacer relaciones: Obtener todas las relaciones asociadas a este step
      const allRelations = await strapi
        .service('api::challenge-relation.challenge-relation')
        .find({
          filters: {
            challenge_step: stepRecord.id
          },
          populate: ['challenge_subcategory']
        });
      console.log('Todas las relaciones para el step:', allRelations);

      // Para cada relación, si su challenge_subcategory no está entre las nuevas, se "deshace" la relación quitando ambas asociaciones.
      if (allRelations && allRelations.results && allRelations.results.length > 0) {
        for (const relation of allRelations.results) {
          // Si ya no se envió la subcategoría (o no está poblada) se "deshace" la relación
          if (!relation.challenge_subcategory || !newSubcatIds.includes(relation.challenge_subcategory.id)) {
            console.log(`Deshaciendo relación con id ${relation.documentId} porque la subcategoría ya no está presente`);
            await strapi
              .service('api::challenge-relation.challenge-relation')
              .update(relation.documentId, {
                data: {
                  // challenge_step: null,
                  challenge_subcategory: null
                }
              });
            console.log(`Relación con id ${relation.id} actualizada para remover asociaciones`);
          }
        }
      }
      console.log("updatedStep", updatedStep);
      ctx.send(updatedStep);
    } catch (error) {
      console.error('Error en updateWithRelations:', error);
      ctx.throw(500, error);
    }
  },
  async getAllData(ctx) {
    console.log('getAllData');
    try {
      const { documentId } = ctx.params; // Se extrae el documentId de los parámetros de la URL
      let steps;

      if (documentId) {
        // Si se proporciona documentId, filtramos la búsqueda
        steps = await strapi
          .service('api::challenge-step.challenge-step')
          .find({
            filters: { documentId },
            populate: {
              challenge_relations: {
                populate: ['challenge_subcategory', 'challenge_stages']
              }
            }
          });
      } else {
        // Si no, obtenemos todos los steps
        steps = await strapi
          .service('api::challenge-step.challenge-step')
          .find({
            populate: {
              challenge_relations: {
                populate: ['challenge_subcategory', 'challenge_stages']
              }
            }
          });
      }

      console.log('Steps encontrados:', JSON.stringify(steps, null, 2));

      // Procesamos cada step para extraer y filtrar subcategorías y stages
      steps.data = steps.results.map(step => {
        console.log('Procesando step con documentId:', step.documentId);
        const subcategories = [];
        const stages = [];

        if (step.challenge_relations && Array.isArray(step.challenge_relations)) {
          step.challenge_relations.forEach(relation => {
            console.log('Procesando relación:', JSON.stringify(relation, null, 2));

            // Procesamos la subcategoría
            if (relation.challenge_subcategory) {
              console.log('Subcategoría encontrada:', JSON.stringify(relation.challenge_subcategory, null, 2));
              if (!subcategories.find(sc => sc.documentId === relation.challenge_subcategory.documentId)) {
                subcategories.push(relation.challenge_subcategory);
              }
            }

            // Procesamos los stages: pueden venir como objeto único o arreglo
            if (relation.challenge_stages) {
              const relationStages = Array.isArray(relation.challenge_stages)
                ? relation.challenge_stages
                : [relation.challenge_stages];
              relationStages.forEach(stage => {
                console.log('Stage encontrado:', JSON.stringify(stage, null, 2));
                if (!stages.find(s => s.documentId === stage.documentId)) {
                  stages.push(stage);
                }
              });
            }
          });
        }

        // Retornamos el objeto step enriquecido con los arrays filtrados
        return {
          ...step,
          challenge_subcategories: subcategories,
          challenge_stages: stages
        };
      });

      // console.log('Steps procesados:', JSON.stringify(steps, null, 2));
      ctx.send(steps);
    } catch (error) {
      console.error('Error en getAllData:', error);
      ctx.throw(500, error);
    }
  }



}));
