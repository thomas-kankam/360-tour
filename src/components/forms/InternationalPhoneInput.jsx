import PhoneInput from "react-phone-number-input";
import { DEFAULT_PHONE_COUNTRY } from "../../utils/phoneUtils";
import "react-phone-number-input/style.css";

export default function InternationalPhoneInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  hasError = false,
  placeholder = "Enter phone number",
  defaultCountry = DEFAULT_PHONE_COUNTRY,
}) {
  return (
    <div
      className={[
        "tours-phone-input",
        hasError ? "tours-phone-input--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PhoneInput
        id={id}
        name={name}
        international
        defaultCountry={defaultCountry}
        countryCallingCodeEditable={false}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
      />
    </div>
  );
}
