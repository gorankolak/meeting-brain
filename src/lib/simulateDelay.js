export const simulateDelay = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));
