const VALID_KEYS = ["filter", "page"];

export const loadURL = () => {
  const windowData = Object.fromEntries(
    new URL(window.location).searchParams.entries()
  );
  const arr = [];
  VALID_KEYS.forEach((key) => {
    if (windowData[key]) arr.push([[key], windowData[key]]);
  });
  return Object.fromEntries(arr);
};

export const saveURL = ({ filter, page }) => {
  window.history.pushState(
    null,
    document.title,
    `${window.location.pathname}?filter=${filter}&page=${page}`
  );
};
