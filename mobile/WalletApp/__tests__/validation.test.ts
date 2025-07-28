// mobile/WalletApp/__tests__/validation.test.ts
import {
  validatePhone,
  validateOtp,
  validateAmount,
} from '../src/utils/validation';

describe('validation utils', () => {
  test('validatePhone', () => {
    expect(validatePhone('3001234567')).toBe(true);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abcdefghij')).toBe(false);
    expect(validatePhone('30012345678')).toBe(false);
  });

  test('validateOtp', () => {
    expect(validateOtp('123456')).toBe(true);
    expect(validateOtp('000000')).toBe(true);
    expect(validateOtp('12345')).toBe(false);
    expect(validateOtp('1234567')).toBe(false);
  });

  test('validateAmount', () => {
    expect(validateAmount('100')).toBe(true);
    expect(validateAmount('0.01')).toBe(true);
    expect(validateAmount('1234.56')).toBe(true);
    expect(validateAmount('1234.567')).toBe(false);
    expect(validateAmount('0')).toBe(false);
    expect(validateAmount('-10')).toBe(false);
    expect(validateAmount('abc')).toBe(false);
  });
});
