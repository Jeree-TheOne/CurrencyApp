const API_KEY =
  "54c6ccd58c4c27bbb73c44cce886dcfc6adc6c0c73e3c4ab269594bfa205d55e";
const AGGREGATE_INDEX = "5";
const tickers = new Map();
let availableTickers;
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
let BTC_CURRENCY = 0.0;
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    TOSYMBOL: toCurrency,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: parameter,
  } = JSON.parse(e.data);

  if (message == "INVALID_SUB" && parameter.split("~")[3] == "USD") {
    const ticker = parameter.split("~")[2];
    subscribeToUpdateBTC(ticker);
    unsubscribeFromUpdateWS(ticker);
    return;
  }
  if (message == "INVALID_SUB" && parameter.split("~")[3] == "BTC") {
    const ticker = parameter.split("~")[2];
    unsubscribeFromUpdateBTC(ticker);
    const handlers = tickers.get(ticker) ?? [];

    handlers.forEach((fn) => fn("-"));
    return;
  }
  if (type != AGGREGATE_INDEX || !newPrice) {
    return;
  }
  const handlers = tickers.get(currency) ?? [];
  handlers.forEach((fn) =>
    fn(toCurrency == "USD" ? newPrice : newPrice * BTC_CURRENCY)
  );
});

const sendToWS = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener("open", () => socket.send(stringifiedMessage), {
    once: true,
  });
};

export const subscribeToUpdate = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];

  tickers.set(ticker, [...subscribers, cb]);
  subscribeToUpdateWS(ticker);
};

const unsubscribeFromUpdateWS = (ticker) => {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

const subscribeToUpdateWS = (ticker) => {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};
const subscribeToUpdateBTC = (ticker) => {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });
};
const unsubscribeFromUpdateBTC = (ticker) => {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });
};

export const unsubscribeFromUpdate = (ticker) => {
  tickers.delete(ticker);
  unsubscribeFromUpdateWS(ticker);
};

subscribeToUpdate("BTC", (price) => {
  BTC_CURRENCY = price;
});

export const getAvailableTickers = (ticker) => {
  if (!ticker) return ["BTC", "DOGE", "ETH"];
  const tickers = availableTickers.filter(
    (t) => t[1].symbol.includes(ticker) || t[1].partner_symbol.includes(ticker)
  );
  return tickers.slice(0, 3).map((t) => t[0]);
};

(async function () {
  const data = await fetch(
    `https://min-api.cryptocompare.com/data/blockchain/list?api_key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => {
      return data.Data;
    });
  availableTickers = Object.entries(data);
})();
