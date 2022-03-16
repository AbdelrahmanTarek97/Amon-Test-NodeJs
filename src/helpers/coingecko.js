const { request } = require('./utils');
const errors = require('./errors');

const CoinGecko = {
  async fetchCoinPrice(code, currency = 'usd') {
    // We need to get the coin id since it's not consistent with the name in local database,
    // We also need to check whether the coin 'symbol' is the same as our local coin 'code'
    // The query returns an object that has an array called coins which includes all the coins that came back from our search
    let searchApiResults;

    // Try and catch any errors during the api call, if an error occurs, indicate that coingecko has refused the request for some reason
    searchApiResults = await request.get(`https://api.coingecko.com/api/v3/search?query=${code.toLowerCase()}`);

    let { coins } = searchApiResults ? searchApiResults.data : null;

    // Check if the coins array has at least one coin
    errors.assertExposable(coins ? coins.length : null, 'coin_not_found_on_coingecko', null, null);

    // Look for a coin that matches the same symbol as the searched for coin
    let coinFromApiCall;
    let coinFound = false;

    for (let i = 0; i < coins.length && !coinFound; i++) {
      if (coins[i].symbol.toLowerCase() == code.toLowerCase()) {
        coinFromApiCall = coins[i];
        coinFound = true;
      }
    }

    // Check that the local coin 'code' is the same as the query result coin's 'id'
    // If the condition fails, then the coin found on coingecko is not the same as our local coin
    errors.assertExposable(coinFromApiCall, 'coin_not_found_on_coingecko', null, null);

    // use the coinId from the api call to find the coin's data
    // Try and catch any errors during the api call, if an error occurs, indicate that coingecko has refused the request for some reason
    coinFromApiCall = (await request.get(`https://api.coingecko.com/api/v3/coins/${coinFromApiCall.id.toLowerCase()}`))
      .data;
    // // Ensure that the coin from the api call exists
    // errors.assertExposable(coinFromApiCall, 'coin_not_found_on_coingecko', null, null);

    // Get market price in USD
    // Use chaining in order to prevent errors for accessing 'undefined' properties
    let coinPrice = coinFromApiCall.market_data.current_price[currency];

    // Any issues accessing the market price is a coingecko issue, and is best presented as a 'coin not found' issue.
    errors.assertExposable(coinPrice, 'currency_not_found', null, null);

    return { coinPrice, dateOfFetching: new Date(), currency };
  },
};

module.exports = CoinGecko;
