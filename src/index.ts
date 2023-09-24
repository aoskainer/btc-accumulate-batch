import CalculateService from "./CalculateService";
import CustomLogger from "./CustomLogger";
import GmoCoinClient from "./GmoCoinClient";

function main() {
  const logger = new CustomLogger("gmocoin");

  try {
    const calculateService = new CalculateService(logger);
    const gmoCoinClient = new GmoCoinClient(logger);
    // 1回の取引上限チェック
    const maxInvestJpy = calculateService.getMaxInvestJpy();
    // 取引余力チェック
    const availableJpy = gmoCoinClient.getMargin();
    // BTC最良気配値チェック
    const btcAskPrice = gmoCoinClient.getBtcTicker();
    if (btcAskPrice == null) {
      logger.finalize();
      return;
    }
    // BTC購入数量計算
    const btcAmount = calculateService.calculateBtcBuyAmount(availableJpy, maxInvestJpy, btcAskPrice);
    // 買い注文
    gmoCoinClient.order(btcAmount);
  } catch (e) {
    logger.error(e);
  } finally {
    logger.finalize();
  }
}
