// mobile/WalletApp/src/utils/format.ts

/**
 * Formatea un número como moneda con separador de miles.
 * e.g. 1234567.89 → "$1,234,567.89"
 */
export function formatCurrency(val: number): string {
  // forzar dos decimales si tiene parte decimal
  const parts = val.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decPart = parts[1];
  return `$${intPart}.${decPart}`;
}
