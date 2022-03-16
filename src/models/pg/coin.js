const { v4: uuid } = require('uuid');
const { pick } = require('lodash');
// For some unknown reason, circleCI complains from this require when it runs eslint, so i disabled it for only this line
// eslint-disable-next-line node/no-missing-require
const coinGecko = require('../../helpers/coingecko');

module.exports = function (sequelize, DataTypes) {
  const Coin = sequelize.define(
    'Coin',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuid(),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      dateOfLastPriceUpdate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );

  Coin.prototype.filterKeys = function () {
    const obj = this.toObject();
    const filtered = pick(obj, 'name', 'code', 'price');

    return filtered;
  };

  Coin.findByCoinCode = async function (code, tOpts = {}) {
    let coin = await Coin.findOne(Object.assign({ where: { code } }, tOpts));

    if (!coin) return null;

    // Check if coin has price value and whether the time since the last price update is less than 1 hour ago
    if (coin.price && coin.dateOfLastPriceUpdate) {
      let currentDate = new Date();
      let dateDifferenceInMinutes =
        parseInt(currentDate.getTime() - coin.dateOfLastPriceUpdate.getTime()) /
        (process.env.PRICE_VALIDITY_TIMEOUT || 1000 * 60);

      // If so, return the coin object as is since no update is required
      if (dateDifferenceInMinutes < 60) return coin;
    }

    let { coinPrice, dateOfFetching } = await coinGecko.fetchCoinPrice(coin.code, 'usd');

    // Update coin data using the new price and price date
    await coin.update({ price: coinPrice, dateOfLastPriceUpdate: dateOfFetching });

    return coin;
  };

  Coin.createCoin = async function (coinObject) {
    coinObject = pick(coinObject, ['name', 'code']);

    if (!coinObject.code || !coinObject.name) return null;

    // Check if coin exists
    let { coinPrice, dateOfFetching } = await coinGecko.fetchCoinPrice(coinObject.code, 'usd');

    let coin = await Coin.create(Object.assign(coinObject), ['name', 'code']);

    // Update coin data using the new price and price date
    await coin.update({ price: coinPrice, dateOfLastPriceUpdate: dateOfFetching });

    return coin;
  };

  return Coin;
};
