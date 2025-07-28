// mobile/WalletApp/__tests__/format.test.ts
import { formatCurrency } from '../src/utils/format';

describe('formatCurrency', () => {
  test('entero sin decimales', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  test('monto con decimales', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('grande con miles', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  test('cero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
