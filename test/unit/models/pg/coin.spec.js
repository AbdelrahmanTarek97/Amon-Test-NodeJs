const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const sequelizeMockingMocha = require('sequelize-mocking').sequelizeMockingMocha;
const Models = require(path.join(srcDir, '/models/pg'));
const DB = require(path.join(srcDir, 'modules/db'));
const Utils = require('../pg/../../../../src/helpers/utils');

describe('Model:coin', () => {
  let sandbox = null;

  sequelizeMockingMocha(DB.sequelize, [path.resolve('test/mocks/coins.json')], { logging: false });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    this.coin = await Models.Coin.findByPk('26a05507-0395-447a-bbbb-000000000000');
  });

  afterEach(() => {
    sandbox && sandbox.restore();
    delete process.env.PRICE_VALIDITY_TIMEOUT;
  });

  it('Should create', async () => {
    const coin = await Models.Coin.create({
      name: 'Bitcoin Cash',
      code: 'BCH',
    });

    expect(coin.name).to.eq('Bitcoin Cash');
    expect(coin.code).to.eq('BCH');
  });

  it('Should find by coinCode', async () => {
    const coinCode = this.coin.code;
    const coin = await Models.Coin.findByCoinCode(coinCode);

    expect(coin.id).to.eq(this.coin.id);
  });

  it('Should filterKeys and return 2 properties if there is no trace of the inserted coin on coingecko (since price cannot be retrieved)', async () => {
    const coin = await Models.Coin.create({
      name: 'Amon',
      code: 'AMN',
    });

    const filterCoin = coin.filterKeys();
    expect(Object.keys(filterCoin).length).to.eq(2);
  });

  it('Should filterKeys and return 3 properties if there is a trace of the inserted coin on coingecko (since price can be retrieved)', async () => {
    const coin = await Models.Coin.createCoin({
      name: 'Bitcoin',
      code: 'BTC',
    });

    const filterCoin = coin.filterKeys();
    expect(Object.keys(filterCoin).length).to.eq(3);
  });

  it('Should create coin and only use specified fields (code, name) to create coin, and ignore other fields', async () => {
    let coin = await Models.Coin.createCoin({
      name: 'Bitcoin',
      code: 'BTC',
      id: 'fakeID',
      fakeProperty: 'FakeProperty',
    });

    coin = coin.toObject();

    expect(Object.keys(coin)).to.include('code');
    expect(Object.keys(coin)).to.include('name');
    expect(Object.keys(coin)).to.not.include('fakeProperty');
    expect(coin.id).to.not.equals('fakeID');
  });

  it('Should create and return coin with current price and a date of last price fetch', async () => {
    let coin = await Models.Coin.createCoin({
      name: 'Bitcoin',
      code: 'BTC',
    });

    coin = coin.toObject();

    expect(coin.price).to.not.be.null;
    expect(coin.price).to.be.a('number');
    expect(coin.dateOfLastPriceUpdate).to.not.equal(null);
    expect(coin.dateOfLastPriceUpdate).to.be.a('date');
  });

  it('Should get coin with current price and a date of last price fetch, the date of last fetch has to be updated if time difference surpasses the currently set time limit', async () => {
    let coin = await Models.Coin.createCoin({
      name: 'Bitcoin',
      code: 'BTC',
    });

    coin = coin.toObject();

    // Get coin two times using the get method
    coin = await Models.Coin.findByCoinCode(coin.code);
    await Utils.wait(1000);
    let retrievedCoin = await Models.Coin.findByCoinCode(coin.code);

    // date of fetching and price should be the same because time limit has not been exceeded
    expect(coin.price).to.not.be.null;
    expect(coin.price).to.be.a('number');
    expect(coin.dateOfLastPriceUpdate).to.not.equal(null);
    expect(coin.dateOfLastPriceUpdate).to.be.a('date');
    expect(retrievedCoin.price).to.not.be.null;
    expect(retrievedCoin.price).to.be.a('number');
    expect(retrievedCoin.dateOfLastPriceUpdate).to.not.equal(null);
    expect(retrievedCoin.dateOfLastPriceUpdate).to.be.a('date');

    let oldPriceUpdateTime = new Date(coin.dateOfLastPriceUpdate).getTime();
    let newPriceUpdateTime = new Date(retrievedCoin.dateOfLastPriceUpdate).getTime();

    expect(coin.price).to.equal(retrievedCoin.price);
    expect(oldPriceUpdateTime).to.equals(
      newPriceUpdateTime,
      `The difference between the two dates is ${newPriceUpdateTime - oldPriceUpdateTime} ms`
    );

    // wait for some time so that price should be updated
    process.env['PRICE_VALIDITY_TIMEOUT'] = 1;
    await Utils.wait(2000);

    // test again and make sure that the new date is greater than the old date
    retrievedCoin = await Models.Coin.findByCoinCode(coin.code);
    expect(coin.price).to.not.be.null;
    expect(coin.price).to.be.a('number');
    expect(coin.dateOfLastPriceUpdate).to.not.equal(null);
    expect(coin.dateOfLastPriceUpdate).to.be.a('date');
    expect(retrievedCoin.price).to.not.be.null;
    expect(retrievedCoin.price).to.be.a('number');
    expect(retrievedCoin.dateOfLastPriceUpdate).to.not.equal(null);
    expect(retrievedCoin.dateOfLastPriceUpdate).to.be.a('date');

    oldPriceUpdateTime = new Date(coin.dateOfLastPriceUpdate).getTime();
    newPriceUpdateTime = new Date(retrievedCoin.dateOfLastPriceUpdate).getTime();

    expect(oldPriceUpdateTime).to.not.equals(newPriceUpdateTime);
    expect(oldPriceUpdateTime).to.be.lessThan(
      newPriceUpdateTime,
      `The difference between the two dates is ${newPriceUpdateTime - oldPriceUpdateTime}`
    );
  });
});
