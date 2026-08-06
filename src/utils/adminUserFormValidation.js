const FIELD_ORDER = ["first_name", "last_name", "email", "phone_number", "role_id"];

export function scrollToFirstFormError(errors, fieldOrder = FIELD_ORDER) {
  const firstKey = fieldOrder.find((key) => errors[key]);
  if (!firstKey) return;

  requestAnimationFrame(() => {
    const field = document.querySelector(`[data-field="${firstKey}"]`);
    if (!field) return;

    field.scrollIntoView({ behavior: "smooth", block: "center" });

    const focusable = field.querySelector("input:not([type=hidden]), select, textarea, button");
    focusable?.focus?.({ preventScroll: true });
  });
}

export function validateAdminUserForm(values) {
  const errors = {};

  if (!values.first_name?.trim()) {
    errors.first_name = "First name is required.";
  } else if (values.first_name.trim().length < 2) {
    errors.first_name = "First name must be at least 2 characters.";
  }

  if (!values.last_name?.trim()) {
    errors.last_name = "Last name is required.";
  } else if (values.last_name.trim().length < 2) {
    errors.last_name = "Last name must be at least 2 characters.";
  }

  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  const phoneDigits = String(values.phone_number || "").replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phone_number = "Phone number is required.";
  } else if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    errors.phone_number = "Enter a valid phone number.";
  }

  if (!values.role_id) {
    errors.role_id = "Select a role for this admin.";
  }

  return errors;
}
