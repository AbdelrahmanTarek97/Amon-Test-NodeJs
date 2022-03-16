const { expect } = require('chai');
const { assert } = require('console');
const path = require('path');
const Coingecko = require(path.join(srcDir, 'helpers/coingecko'));

describe('Helpers: Coingecko', () => {
  it('Should fetch coin price and return a fetching date which should be close to now', async () => {
    let currentDate = new Date().getTime();

    let { coinPrice, dateOfFetching, currency } = await Coingecko.fetchCoinPrice('BTC', 'usd');
    assert(coinPrice);
    expect(coinPrice).to.be.a('number');
    assert(dateOfFetching);
    expect(dateOfFetching).to.be.a('date');
    expect(currency).to.be.equal('usd');

    dateOfFetching = new Date(dateOfFetching).getTime();

    let timeDifference = dateOfFetching - currentDate;

    expect(timeDifference).to.be.lessThanOrEqual(10000);
  });

  it('Should return an error if the coin does not exist on coingecko', async () => {
    await expect(Coingecko.fetchCoinPrice('ABCDE', 'usd')).to.be.rejectedWith(Error, 'coin_not_found_on_coingecko');
  });

  it('Should use USD as default currency if no currency is specified', async () => {
    let { coinPrice, dateOfFetching, currency } = await Coingecko.fetchCoinPrice('BTC');
    assert(coinPrice);
    expect(coinPrice).to.be.a('number');
    assert(dateOfFetching);
    expect(dateOfFetching).to.be.a('date');
    expect(currency).to.be.equal('usd');
  });

  it('Should return an error if currency does not exist on coingecko', async () => {
    await expect(Coingecko.fetchCoinPrice('BTC', 'pseudocurrency')).to.be.rejectedWith(Error, 'currency_not_found');
  });
});
