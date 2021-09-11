const API_KEY =
  "54c6ccd58c4c27bbb73c44cce886dcfc6adc6c0c73e3c4ab269594bfa205d55e";
const AGGREGATE_INDEX = "5";
const tickers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type != AGGREGATE_INDEX || !newPrice) {
    return;
  }

  const handlers = tickers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
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

export const unsubscribeFromUpdate = (ticker) => {
  tickers.delete(ticker);
  unsubscribeFromUpdateWS(ticker);
};
