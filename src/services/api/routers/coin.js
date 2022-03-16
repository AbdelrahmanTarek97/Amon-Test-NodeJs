const Joi = require('joi');
const Router = require('@koa/router');
const CoinController = require('../controllers/coin');
const { validateParams } = require('../../../helpers/validation');

const CoinRouter = {
  schemaGetByCoinCode: Joi.object({
    coinCode: Joi.string().min(3).uppercase().max(5),
  }),

  schemaCreateCoin: Joi.object({
    code: Joi.string().required().min(3).uppercase().max(5),
    name: Joi.string().required().min(3),
  }),

  async getCoinByCode(ctx) {
    const params = {
      coinCode: ctx.params.coinCode,
    };

    const formattedParams = await validateParams(CoinRouter.schemaGetByCoinCode, params);

    let coin = await CoinController.getCoinByCode(formattedParams.coinCode);

    if (coin) ctx.body = coin;
  },

  async createCoin(ctx) {
    const params = {
      code: ctx.request.body.code,
      name: ctx.request.body.name,
    };

    const formattedParams = await validateParams(CoinRouter.schemaCreateCoin, params);

    ctx.body = await CoinController.createCoin(formattedParams);
  },

  router() {
    const router = Router();

    /**
     * @api {get} / Get coinCode
     * @apiName coinCode
     * @apiGroup Status
     * @apiDescription Get coinCode
     *
     * @apiSampleRequest /
     *
     */
    router.get('/:coinCode', CoinRouter.getCoinByCode);
    router.put('/createCoin', CoinRouter.createCoin);

    return router;
  },
};

module.exports = CoinRouter;
