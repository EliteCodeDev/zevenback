// src/api/challenge-relation/controllers/challenge-relation.js
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::challenge-relation.challenge-relation",
  ({ strapi }) => ({
    async updateWithRelations(ctx) {
      try {
        const { documentId } = ctx.params;
        const {
          challenge_subcategory,
          challenge_step,
          challenge_stages,
          challenge_products,
        } = ctx.request.body.data || {};

        // Validar documentId
        if (!documentId) {
          return ctx.badRequest('El parámetro "documentId" es obligatorio.');
        }

        // Buscar el ChallengeRelation existente
        const relations = await strapi.entityService.findMany(
          "api::challenge-relation.challenge-relation",
          {
            filters: { documentId: { $eq: documentId } },
            populate: ["challenge_stages", "challenge_products", "challenge_subcategory", "challenge_step"],
            limit: 1,
          }
        );
        if (!relations.length) {
          return ctx.notFound(`No se encontró ChallengeRelation con documentId = ${documentId}`);
        }
        const existingRelation = relations[0];

        // Actualizar o crear ChallengeStages
        const updatedStageIDs = [];
        if (Array.isArray(challenge_stages)) {
          for (const stageData of challenge_stages) {
            if (stageData.id && stageData.id !== "default") {
              // Actualizar stage existente solo si hay cambios
              const existingStage = existingRelation.challenge_stages.find(
                (s) => s.id === stageData.id
              );
              if (
                existingStage &&
                (existingStage.minimumTradingDays !== stageData.minimumTradingDays ||
                 existingStage.maximumDailyLoss !== stageData.maximumDailyLoss ||
                 existingStage.maximumTotalLoss !== stageData.maximumTotalLoss ||
                 existingStage.maximumLossPerTrade !== stageData.maximumLossPerTrade ||
                 existingStage.profitTarget !== stageData.profitTarget ||
                 existingStage.leverage !== stageData.leverage ||
                 existingStage.name !== stageData.name)
              ) {
                const updatedStage = await strapi.entityService.update(
                  "api::challenge-stage.challenge-stage",
                  stageData.id,
                  {
                    data: {
                      name: stageData.name,
                      minimumTradingDays: stageData.minimumTradingDays,
                      maximumDailyLoss: stageData.maximumDailyLoss,
                      maximumTotalLoss: stageData.maximumTotalLoss,
                      maximumLossPerTrade: stageData.maximumLossPerTrade,
                      profitTarget: stageData.profitTarget,
                      leverage: stageData.leverage,
                    },
                  }
                );
                updatedStageIDs.push(updatedStage.id);
              } else {
                updatedStageIDs.push(stageData.id); // Mantener sin cambios
              }
            } else if (stageData.id === "default") {
              // Crear nuevo stage
              const newStage = await strapi.entityService.create(
                "api::challenge-stage.challenge-stage",
                {
                  data: {
                    name: stageData.name,
                    minimumTradingDays: stageData.minimumTradingDays,
                    maximumDailyLoss: stageData.maximumDailyLoss,
                    maximumTotalLoss: stageData.maximumTotalLoss,
                    maximumLossPerTrade: stageData.maximumLossPerTrade,
                    profitTarget: stageData.profitTarget,
                    leverage: stageData.leverage,
                    challenge_relations: [existingRelation.id],
                  },
                }
              );
              updatedStageIDs.push(newStage.id);
            }
          }
        }

        // Manejar subcategory
        let subcategoryId = existingRelation.challenge_subcategory?.id || null;
        if (challenge_subcategory && challenge_subcategory.id) {
          subcategoryId = challenge_subcategory.id;
        } else if (challenge_subcategory === null) {
          subcategoryId = null;
        }

        // Manejar step
        let stepId = existingRelation.challenge_step?.id || null;
        if (challenge_step && challenge_step.id) {
          stepId = challenge_step.id;
        } else if (challenge_step === null) {
          stepId = null;
        }

        // Manejar products
        let productIDs = existingRelation.challenge_products.map((p) => p.id);
        if (Array.isArray(challenge_products)) {
          productIDs = challenge_products.map((p) => p.id).filter(Boolean);
        }

        // Actualizar ChallengeRelation
        const updatedRelation = await strapi.entityService.update(
          "api::challenge-relation.challenge-relation",
          existingRelation.id,
          {
            data: {
              challenge_subcategory: subcategoryId,
              challenge_step: stepId,
              challenge_stages: updatedStageIDs,
              challenge_products: productIDs,
              publishedAt: new Date().toISOString(),
            },
            populate: [
              "challenge_subcategory",
              "challenge_step",
              "challenge_stages",
              "challenge_products",
            ],
          }
        );

        return this.transformResponse(updatedRelation);
      } catch (error) {
        console.error("Error en updateWithRelations:", error);
        return ctx.badRequest("Error al actualizar ChallengeRelation con relaciones.");
      }
    },
  })
);