const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{8,20}$/;

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Email is required";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return "";
}

export function validatePhone(value) {
  const v = value.trim();
  if (!v) return "Phone number is required";
  if (!PHONE_RE.test(v)) return "Enter a valid phone number (8+ digits)";
  return "";
}

export function validateRequired(value, label = "This field") {
  if (!String(value ?? "").trim()) return `${label} is required`;
  return "";
}

export function validateCardNumber(value) {
  const digits = value.replace(/\s/g, "");
  if (!digits) return "Card number is required";
  if (!/^\d{16}$/.test(digits)) return "Enter a valid 16-digit card number";
  return "";
}

export function validateExpiry(value) {
  const v = value.trim();
  if (!v) return "Expiry date is required";
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Use MM/YY format";
  const [mm, yy] = v.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month";
  const now = new Date();
  const exp = new Date(2000 + yy, mm);
  if (exp <= now) return "Card has expired";
  return "";
}

export function validateCvv(value) {
  const v = value.trim();
  if (!v) return "CVV is required";
  if (!/^\d{3,4}$/.test(v)) return "Enter 3 or 4 digits";
  return "";
}

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
