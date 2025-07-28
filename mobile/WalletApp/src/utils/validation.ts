// mobile/WalletApp/src/utils/validation.ts

/**
 * Valida un celular de 10 dígitos.
 */
export function validatePhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

/**
 * Valida que el OTP sea exactamente 6 dígitos.
 */
export function validateOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Valida que el monto sea un número > 0 y con hasta 2 decimales.
 */
export function validateAmount(amount: string): boolean {
  // sólo dígitos y opcional punto con 1 o 2 decimales
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return false;
  const n = parseFloat(amount);
  return !isNaN(n) && n > 0;
}
