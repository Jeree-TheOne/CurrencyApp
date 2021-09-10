const API_KEY =
  "54c6ccd58c4c27bbb73c44cce886dcfc6adc6c0c73e3c4ab269594bfa205d55e";

const tickers = new Map();

export const loadTickers = () => {
  if (tickers.size === 0) return;
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      console.log(updatedPrices);
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        console.log(currency, newPrice);
        const handlers = tickers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToUpdate = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];

  tickers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromUpdate = (ticker) => {
  tickers.delete(ticker);
};

setInterval(loadTickers, 5000);

window.tickers = tickers;
