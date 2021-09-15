export const getTickers = () => {
  const data = localStorage.getItem("cryptonomicon-list");
  if (!data) return [];
  return JSON.parse(data);
};

export const saveTickers = (tickers) => {
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers));
};
