import type { MobileRole } from "./data";
export type DemoChallenge = {
  phone: string;
  role: MobileRole;
  code: string;
  expiresAt: number;
  resendAt: number;
  attempts: number;
  verified: boolean;
  registered?: boolean;
};
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const phone = digits.startsWith("258") ? `+${digits}` : `+258${digits}`;
  return /^\+2588[2-7]\d{7}$/.test(phone) ? phone : null;
}
export function issueDemoOtp(
  phone: string,
  role: MobileRole,
  now: number,
): DemoChallenge {
  return {
    phone,
    role,
    code: "123456",
    expiresAt: now + 180000,
    resendAt: now + 30000,
    attempts: 0,
    verified: false,
  };
}
export function checkDemoOtp(
  challenge: DemoChallenge,
  code: string,
  now: number,
) {
  if (challenge.verified)
    return { challenge, error: "Este código já foi utilizado." };
  if (now >= challenge.expiresAt)
    return { challenge, error: "O código expirou. Pede um novo código." };
  if (challenge.attempts >= 5)
    return {
      challenge,
      error: "Limite de tentativas atingido. Pede um novo código.",
    };
  const next = {
    ...challenge,
    attempts: challenge.attempts + 1,
    verified: code === challenge.code,
  };
  return {
    challenge: next,
    error: next.verified ? "" : "Código incorrecto. Tenta novamente.",
  };
}
