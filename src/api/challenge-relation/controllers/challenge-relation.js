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
          stage_parameters,
          product_configs,
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
            populate: [
              "challenge_stages", 
              "challenge_products", 
              "challenge_subcategory", 
              "challenge_step",
              "stage_parameters",
              "product_configs",
              "stage_parameters.challenge_stage",
              "product_configs.challenge_product"
            ],
            limit: 1,
          }
        );
        
        if (!relations.length) {
          return ctx.notFound(`No se encontró ChallengeRelation con documentId = ${documentId}`);
        }
        const existingRelation = relations[0];

        // 1. Manejar stages
        const updatedStageIDs = [];
        if (Array.isArray(challenge_stages)) {
          // Para cada stage, simplemente actualizamos la asociación - ya no guardamos los parámetros aquí
          for (const stageData of challenge_stages) {
            if (stageData.id) {
              updatedStageIDs.push(stageData.id);
            }
          }
        }

        // 2. Manejar subcategory
        let subcategoryId = existingRelation.challenge_subcategory?.id || null;
        if (challenge_subcategory && challenge_subcategory.id) {
          subcategoryId = challenge_subcategory.id;
        } else if (challenge_subcategory === null) {
          subcategoryId = null;
        }

        // 3. Manejar step
        let stepId = existingRelation.challenge_step?.id || null;
        if (challenge_step && challenge_step.id) {
          stepId = challenge_step.id;
        } else if (challenge_step === null) {
          stepId = null;
        }

        // 4. Manejar products
        let productIDs = existingRelation.challenge_products.map((p) => p.id);
        if (Array.isArray(challenge_products)) {
          productIDs = challenge_products.map((p) => p.id).filter(Boolean);
        }

        // 5. Actualizar ChallengeRelation
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
              "stage_parameters",
              "product_configs",
            ],
          }
        );

        // 6. Manejar stage_parameters (NUEVO)
        if (Array.isArray(stage_parameters)) {
          // Para cada parámetro enviado
          for (const paramData of stage_parameters) {
            if (!paramData.challenge_stage || !paramData.challenge_stage.id) {
              continue; // Ignorar si no tiene stage_id
            }

            const stageId = paramData.challenge_stage.id;
            
            // Buscar si ya existe un parámetro para esta relación y este stage
            const existingParamsForStage = existingRelation.stage_parameters?.find(
              p => p.challenge_stage?.id === stageId
            );

            if (existingParamsForStage) {
              // Actualizar parámetro existente
              await strapi.entityService.update(
                "api::stage-parameter.stage-parameter",
                existingParamsForStage.id,
                {
                  data: {
                    minimumTradingDays: paramData.minimumTradingDays,
                    maximumDailyLoss: paramData.maximumDailyLoss,
                    profitTarget: paramData.profitTarget,
                    maximumTotalLoss: paramData.maximumTotalLoss,
                    maximumLossPerTrade: paramData.maximumLossPerTrade,
                    leverage: paramData.leverage,
                  },
                }
              );
            } else {
              // Crear nuevo parámetro
              await strapi.entityService.create(
                "api::stage-parameter.stage-parameter",
                {
                  data: {
                    challenge_stage: stageId,
                    challenge_relation: existingRelation.id,
                    minimumTradingDays: paramData.minimumTradingDays,
                    maximumDailyLoss: paramData.maximumDailyLoss,
                    profitTarget: paramData.profitTarget,
                    maximumTotalLoss: paramData.maximumTotalLoss,
                    maximumLossPerTrade: paramData.maximumLossPerTrade,
                    leverage: paramData.leverage,
                  },
                }
              );
            }
          }
        }

        // 7. Manejar product_configs (NUEVO)
        if (Array.isArray(product_configs)) {
          // Para cada configuración enviada
          for (const configData of product_configs) {
            if (!configData.challenge_product || !configData.challenge_product.id) {
              continue; // Ignorar si no tiene product_id
            }

            const productId = configData.challenge_product.id;
            
            // Buscar si ya existe una configuración para esta relación y este producto
            const existingConfigForProduct = existingRelation.product_configs?.find(
              c => c.challenge_product?.id === productId
            );

            if (existingConfigForProduct) {
              // Actualizar configuración existente
              await strapi.entityService.update(
                "api::product-config.product-config",
                existingConfigForProduct.id,
                {
                  data: {
                    precio: configData.precio,
                  },
                }
              );
            } else {
              // Crear nueva configuración
              await strapi.entityService.create(
                "api::product-config.product-config",
                {
                  data: {
                    challenge_product: productId,
                    challenge_relation: existingRelation.id,
                    precio: configData.precio,
                  },
                }
              );
            }
          }
        }

        // Devolver respuesta
        return this.transformResponse(updatedRelation);
      } catch (error) {
        console.error("Error en updateWithRelations:", error);
        return ctx.badRequest(`Error al actualizar: ${error.message}`);
      }
    },
  })
);