const path = require('path');
const sinon = require('sinon');
const Router = require('@koa/router');
const CoinRouter = require(path.join(srcDir, '/services/api/routers/coin'));
const config = require(path.join(srcDir, '../config'));
const { assert } = require('console');
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

  it('Should get coin', async () => {
    sandbox.stub(CoinController, 'getCoinByCode').resolves('coin');
    const ctx = {
      cacheControl: sandbox.stub(),
    };
    await CoinRouter.getCoinByCode(ctx);

    expect(ctx.body).to.eq('coin');

    expect(ctx.cacheControl.calledOnce).to.be.true;
    expect(ctx.cacheControl.calledWith(60 * 1000)).to.be.true;
  });

  it('Should create coin', async () => {
    sandbox.stub(CoinController, 'createCoin').resolves('coin');
    const ctx = {
      cacheControl: sandbox.stub(),
    };
    await CoinRouter.createCoin(ctx);

    expect(ctx.body).to.eq('coin');

    expect(ctx.cacheControl.calledOnce).to.be.true;
    expect(ctx.cacheControl.calledWith(60 * 1000)).to.be.true;
  });
});
