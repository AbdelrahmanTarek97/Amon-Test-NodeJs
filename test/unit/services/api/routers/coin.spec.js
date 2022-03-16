const path = require('path');
const sinon = require('sinon');
const Router = require('@koa/router');
const CoinRouter = require(path.join(srcDir, '/services/api/routers/coin'));
const config = require(path.join(srcDir, '../config'));
const CoinController = require('../../../../../src/services/api/controllers/coin');

describe('Router: Coin', () => {
  let sandbox = null;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    this.get = sandbox.stub(Router.prototype, 'get');
  });

  afterEach(() => {
    config.DEMO_ACCOUNT = null;
    sandbox && sandbox.restore();
  });

  it('Should get router', async () => {
    const router = await CoinRouter.router();

    expect(router instanceof Router).to.be.true;
    expect(router.get.calledWith('/:coinCode', CoinRouter.getCoinByCode)).to.be.true;
  });

  it('Should call the get coin function in the controller', async () => {
    sandbox.stub(CoinController, 'getCoinByCode').resolves('coin');
    const ctx = {
      cacheControl: sandbox.stub(),
      params: {
        coinCode: 'BTC',
      },
    };
    await CoinRouter.getCoinByCode(ctx);

    expect(ctx.body).to.eq('coin');
  });

  it('Should call the create coin function in the controller', async () => {
    sandbox.stub(CoinController, 'createCoin').resolves('coin');
    const ctx = {
      cacheControl: sandbox.stub(),
      request: {
        body: {
          code: 'BTC',
          name: 'Bitcoin',
        },
      },
    };
    await CoinRouter.createCoin(ctx);

    expect(ctx.body).to.eq('coin');
  });
});
