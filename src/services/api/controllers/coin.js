const errors = require('../../../helpers/errors');
const Models = require('../../../models/pg');

const CoinController = {
  async getCoinByCode(coinCode) {
    let coin = await Models.Coin.findByCoinCode(coinCode);

    errors.assertExposable(coin, 'unknown_coin_code', null, null);

    return coin.filterKeys();
  },

  async createCoin(coinObject) {
    let coinExists = (await Models.Coin.findByCoinCode(coinObject.code)) ? true : false;

    errors.assertExposable(!coinExists, 'duplicate_coin_code', null, null);

    let coin = await Models.Coin.createCoin(coinObject);

    errors.assertExposable(coin, 'bad_params', null, null);

    return coin.filterKeys();
  },
};

module.exports = CoinController;
