const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const sequelizeMockingMocha = require('sequelize-mocking').sequelizeMockingMocha;
const CoinController = require(path.join(srcDir, '/services/api/controllers/coin'));
const DB = require(path.join(srcDir, 'modules/db'));

describe('Controller: Coin', () => {
  let sandbox = null;

  sequelizeMockingMocha(DB.sequelize, [path.resolve('test/mocks/coins.json')], { logging: false });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox && sandbox.restore();
  });

  describe('getCoinByCode', () => {
    it('should get coin by code', async () => {
      const coinCode = 'BTC';
      const coin = await CoinController.getCoinByCode(coinCode);
      let coinObjectKeys = Object.keys(coin);
      expect(coin.code).to.eq(coinCode);
      expect(coinObjectKeys.length).to.eq(3);
      expect(coinObjectKeys).to.include('name');
      expect(coinObjectKeys).to.include('code');
      expect(coinObjectKeys).to.include('price');
    });

    it('should fail get coin by code', async () => {
      const coinCode = 'AMN';
      expect(CoinController.getCoinByCode(coinCode)).to.be.rejectedWith(Error, 'unknown_coin_code');
    });
  });

  describe('createCoin', () => {
    it('Should create coin and add it to database, and return coin data', async () => {
      let createdCoin = await CoinController.createCoin({ code: 'best', name: 'Bitcoin and Ethereum Standard Token' });
      let coinObjectKeys = Object.keys(createdCoin);
      expect(createdCoin.code).to.eq('best');
      expect(createdCoin.name).to.eq('Bitcoin and Ethereum Standard Token');
      expect(coinObjectKeys.length).to.eq(3);
      expect(coinObjectKeys).to.include('name');
      expect(coinObjectKeys).to.include('code');
      expect(coinObjectKeys).to.include('price');

      // Now retrieve the token from the database and check if it exists
      createdCoin = await CoinController.getCoinByCode('best');
      coinObjectKeys = Object.keys(createdCoin);
      expect(createdCoin.code).to.eq('best');
      expect(createdCoin.name).to.eq('Bitcoin and Ethereum Standard Token');
      expect(coinObjectKeys.length).to.eq(3);
      expect(coinObjectKeys).to.include('name');
      expect(coinObjectKeys).to.include('code');
      expect(coinObjectKeys).to.include('price');
    });

    it('Should return an error when a non-existing coin is created (Does not exist on coingecko, coin should not be stored)', async () => {
      await expect(CoinController.createCoin({ code: 'ABCDE', name: 'ABCDE' })).to.be.rejectedWith(
        Error,
        'coin_not_found_on_coingecko'
      );
      await expect(CoinController.getCoinByCode('ABCDE')).to.be.rejectedWith(Error, 'unknown_coin_code');
    });

    it('Should return an error when a coin code is not provided', async () => {
      await expect(CoinController.createCoin({ code: '', name: 'ABCDE' })).to.be.rejectedWith(Error, 'bad_params');
    });

    it('Should return an error when a coin name is not provided', async () => {
      await expect(CoinController.createCoin({ code: 'ABCDE', name: '' })).to.be.rejectedWith(Error, 'bad_params');
    });
    it('Should return an error when a coin is a duplicate', async () => {
      await CoinController.createCoin({ code: 'AMN', name: 'Amon' });
      await expect(CoinController.createCoin({ code: 'AMN', name: 'Amon' })).to.be.rejectedWith(
        Error,
        'duplicate_coin_code'
      );
    });
  });
});
