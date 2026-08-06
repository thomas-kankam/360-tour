import { useRef } from "react";

/**
 * Six individual digit boxes that auto-advance, support backspace navigation,
 * and handle paste of a full OTP string.
 */
export default function OtpInput({ value = "", onChange, disabled = false, error = false }) {
  const slots = 6;
  const digits = value.split("").concat(Array(slots).fill("")).slice(0, slots);
  const refs = useRef([]);

  function focusAt(i) {
    refs.current[i]?.focus();
  }

  function handleChange(i, e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const char = raw[raw.length - 1];
    const next = digits.map((d, idx) => (idx === i ? char : d));
    onChange(next.join(""));
    if (i < slots - 1) focusAt(i + 1);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        const next = digits.map((d, idx) => (idx === i ? "" : d));
        onChange(next.join(""));
      } else if (i > 0) {
        const next = digits.map((d, idx) => (idx === i - 1 ? "" : d));
        onChange(next.join(""));
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < slots - 1) {
      focusAt(i + 1);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, slots);
    if (!pasted) return;
    const next = Array(slots).fill("").map((_, i) => pasted[i] || "");
    onChange(next.join(""));
    focusAt(Math.min(pasted.length, slots - 1));
  }

  return (
    <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={[
            "h-14 w-12 rounded-xl border-2 text-center text-xl font-bold text-brand-ink outline-none transition-all duration-200",
            error
              ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : [
                  "focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
                  d ? "border-brand-green bg-brand-green/5" : "border-brand-border bg-white",
                ].join(" "),
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
