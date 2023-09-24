import CustomLogger from "./CustomLogger";
import { IMarginResponse, ISignatureParam, ITickerResponse } from "./types";

class GmoCoinClient {
  logger: CustomLogger;
  apiKey: string;
  secretKey: string;

  constructor(logger: CustomLogger) {
    this.logger = logger;
    this.apiKey = PropertiesService.getScriptProperties().getProperty("GMOCOIN_API_KEY")!;
    this.secretKey = PropertiesService.getScriptProperties().getProperty("GMOCOIN_SECRET_KEY")!;
  }

  /**
   * BTCの現在の売注文最良気配値を取得します。
   */
  getBtcTicker(): number | null {
    const url = "https://api.coin.z.com/public/v1/ticker?symbol=BTC";

    this.logger.debug(`Request: URL = ${url}`);

    const startTime = Date.now();
    const response = UrlFetchApp.fetch(url);
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    this.logger.debug(`Response: status = ${statusCode}, body = ${body}, elapsed = ${elapsed}ms`);

    const responseJson: ITickerResponse = JSON.parse(body);
    const filteredData = responseJson.data.filter((it) => {
      return it.symbol === "BTC";
    });
    if (filteredData.length !== 1) {
      this.logger.error("There is no BTC data in response");
      return null;
    }

    const btcData = filteredData[0];
    const askPrice = parseFloat(btcData.ask);

    this.logger.info(`BTC Ask Price = ${askPrice}(JPY/BTC)`);

    return askPrice;
  }

  /**
   * 余力情報を取得します。
   */
  getMargin(): number {
    const url = "https://api.coin.z.com/private/v1/account/margin";
    const timestamp = Date.now().toString();
    const sign = this._computeHmacSha256Signature({
      timestamp: timestamp,
      method: "GET",
      path: "/v1/account/margin",
      payload: null,
    });

    this.logger.debug(`Request: URL = ${url}`);

    const startTime = Date.now();
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": this.apiKey,
        "API-TIMESTAMP": timestamp,
        "API-SIGN": sign,
      },
    });
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    this.logger.debug(`Response: status = ${statusCode}, body = ${body}, elapsed = ${elapsed}ms`);

    const responseJson: IMarginResponse = JSON.parse(body);
    const availableAmount = parseFloat(responseJson.data.availableAmount);

    this.logger.info(`Avaliable Amount = ${availableAmount}(JPY)`);

    return availableAmount;
  }

  /**
   * BTCの買い注文をリクエストします。
   */
  order(btcAmount: string): void {
    const url = "https://api.coin.z.com/private/v1/order";
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({
      symbol: "BTC",
      side: "BUY",
      executionType: "MARKET",
      size: btcAmount,
    });
    const sign = this._computeHmacSha256Signature({
      timestamp: timestamp,
      method: "POST",
      path: "/v1/order",
      payload: payload,
    });

    this.logger.debug(`Request: URL = ${url}, Payload = ${payload}`);

    const startTime = Date.now();
    const response = UrlFetchApp.fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": this.apiKey,
        "API-TIMESTAMP": timestamp,
        "API-SIGN": sign,
      },
      payload: payload,
    });
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    this.logger.debug(`Response: status = ${statusCode}, body = ${body}, elapsed = ${elapsed}ms`);
  }

  /**
   * GMOコインでヘッダーに入れるための署名を計算します。
   */
  _computeHmacSha256Signature(signatureParam: ISignatureParam): string {
    const { timestamp, method, path, payload } = signatureParam;
    const text = timestamp + method + path + (payload ?? "");
    const signature = Utilities.computeHmacSha256Signature(text, this.secretKey);
    const signatureHex = signature.reduce((str, chr) => {
      const chr16 = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr16.length === 1 ? "0" : "") + chr16;
    }, "");
    return signatureHex;
  }
}

export default GmoCoinClient;
