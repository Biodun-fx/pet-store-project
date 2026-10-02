export const USD_TO_NGN = 1500;

export const toNaira = (amount) => Number(amount) * USD_TO_NGN;

export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNaira(amount));
