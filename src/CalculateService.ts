import CustomLogger from "./CustomLogger";

class CalculateService {
  logger: CustomLogger;

  constructor(logger: CustomLogger) {
    this.logger = logger;
  }

  /**
   * 1回の投資基準額(JPY)を取得します。
   */
  getMaxInvestJpy() {
    const investJpy = parseFloat(PropertiesService.getScriptProperties().getProperty("MAX_INVEST_JPY")!);
    this.logger.info(`Invest Price = ${investJpy}(JPY)`);
    return investJpy;
  }

  /**
   * BTC売注文最良気配値とJPY購入希望額からBTC購入数量を決定します。
   */
  calculateBtcBuyAmount(availableJpy: number, maxInvestJpy: number, btcAskPrice: number): string {
    // これまでの取引で端数が残っている場合があるのでこうしています。
    const investJpy = availableJpy - (Math.floor(availableJpy / maxInvestJpy) - 1) * maxInvestJpy;
    // 最小取引単位である小数第4位で四捨五入します。返る値は文字列です。
    const btcBuyAmount = (investJpy / btcAskPrice).toFixed(4);
    this.logger.info(`Calculated Price = ${investJpy} / ${btcAskPrice} = ${btcBuyAmount}(BTC)`);
    const actualInVestJpy = (btcAskPrice * parseFloat(btcBuyAmount)).toFixed(0);
    this.logger.info(`Actual Invest Price = ${actualInVestJpy}(JPY)`);
    return btcBuyAmount;
  }
}

export default CalculateService;
