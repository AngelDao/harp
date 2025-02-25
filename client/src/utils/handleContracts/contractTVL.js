import { toDecimal, fromWei, toWei } from "../truncateString.js";

export const fetchTVL = async (web3, prices, contracts) => {
  const {
    lqtyToken,
    profitShare,
    rewards,
    factory,
    ETHLPToken,
    LUSDLPToken,
    gStringToken,
    lusdToken,
    farm,
    troveManager,
    stability,
  } = contracts;
  const { STRING, LQTY, LUSD, ETH, gSTRING } = prices;

  // const notadded = true;

  // // if (notadded) {
  //   return [
  //     {
  //       rewards: 0,
  //       factory: 0,
  //       profitShare: 0,
  //       ETHLPToken: 0,
  //       LUSDLPToken: 0,
  //     },
  //     0,
  //     0,
  //   ];
  // }

  const totalSTRINGSS = fromWei(
    web3,
    (await profitShare.methods.pool().call()).lpTokenSupply.toString()
  );

  const totalLQTYR = fromWei(
    web3,
    await lqtyToken.methods.balanceOf(rewards._address).call()
  );

  const totalLUSDF = fromWei(web3, await factory.methods.totalLUSD().call());
  let ETHLP,
    gSTRINGLP,
    LUSDLP,
    gSTRINGLPL,
    ETHLPSupply,
    LUSDLPSupply,
    ETHLPFarm,
    LUSDLPFarm;
  try {
    ETHLP = fromWei(web3, await web3.eth.getBalance(ETHLPToken._address));
    gSTRINGLP = fromWei(
      web3,
      await gStringToken.methods.balanceOf(ETHLPToken._address).call()
    );

    LUSDLP = fromWei(
      web3,
      await lusdToken.methods.balanceOf(LUSDLPToken._address).call()
    );
    gSTRINGLPL = fromWei(
      web3,
      await gStringToken.methods.balanceOf(LUSDLPToken._address).call()
    );

    ETHLPSupply = fromWei(web3, await ETHLPToken.methods.totalSupply().call());
    LUSDLPSupply = fromWei(
      web3,
      await LUSDLPToken.methods.totalSupply().call()
    );

    ETHLPFarm = fromWei(
      web3,
      await ETHLPToken.methods.balanceOf(farm._address).call()
    );

    LUSDLPFarm = fromWei(
      web3,
      await LUSDLPToken.methods.balanceOf(farm._address).call()
    );
  } catch (err) {
    ETHLP = 0;
    gSTRINGLP = 0;
    LUSDLP = 0;
    gSTRINGLPL = 0;
    ETHLPSupply = 0;
    LUSDLPSupply = 0;
    ETHLPFarm = 0;
    LUSDLPFarm = 0;
  }

  const totalLUSDS = fromWei(
    web3,
    await stability.methods
      .getCompoundedFrontEndStake(profitShare._address)
      .call()
  );

  const totalStability = fromWei(
    web3,
    await lusdToken.methods.balanceOf(stability._address).call()
  );

  const ETHLPRatio = ETHLPFarm / ETHLPSupply;
  const LUSDRatio = LUSDLPFarm / LUSDLPSupply;

  const stabilityTVL = parseFloat(totalStability) * LUSD;
  const rewardsTVL = parseFloat(totalLQTYR) * LQTY;
  const profitShareTVL = parseFloat(totalSTRINGSS) * STRING;
  const factoryTVL = parseFloat(totalLUSDF) * LUSD;
  const ETHLPTVL = parseFloat(ETHLP) * ETH + parseFloat(gSTRINGLP) * gSTRING;
  const LUSDLPTVL =
    parseFloat(LUSDLP) * LUSD + parseFloat(gSTRINGLPL) * gSTRING;

  const TVL = {
    rewards: rewardsTVL,
    factory: factoryTVL,
    profitShare: profitShareTVL,
    ETHLPToken: ETHLPTVL * ETHLPRatio,
    LUSDLPToken: LUSDLPTVL * LUSDRatio,
    stability: stabilityTVL,
  };

  const ETHLPPrice = ETHLPTVL / parseFloat(ETHLPSupply);
  const LUSDLPPrice = LUSDLPTVL / parseFloat(LUSDLPSupply);

  const TCR = parseFloat(
    fromWei(
      web3,
      await troveManager.methods.getTCR(toWei(web3, ETH.toString())).call()
    )
  );

  return [TVL, ETHLPPrice, LUSDLPPrice, TCR];
};
