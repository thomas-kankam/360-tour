import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import contactsServiceApi from "../../apis/ContactsServiceApi";
import Container from "../../components/layout/Container";
import SocialLinks from "../../components/layout/SocialLinks";
import env, { getContactPhoneTelHref, getWhatsAppUrl } from "../../config/env";
import { useAuth } from "../../hooks/useAuth";
import { normalizePhoneForApi } from "../../utils/phoneUtils";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

const INQUIRY_TYPES = [
  { value: "general_enquiry", label: "General enquiry" },
  { value: "group_university_tour", label: "Group / university tour" },
  { value: "corporate_retreat", label: "Corporate retreat" },
  { value: "custom_itinerary", label: "Custom itinerary" },
  { value: "partnership_media", label: "Partnership / media" },
  { value: "other", label: "Other" },
];

function getInitialForm(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    inquiry: "",
    message: "",
  };
}

function validateContactForm(form) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) errors.name = "Full name is required.";
  else if (name.length < 2) errors.name = "Enter at least 2 characters.";

  if (!email) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!form.inquiry) errors.inquiry = "Select an inquiry type.";

  if (!message) errors.message = "Message is required.";
  else if (message.length < 10) errors.message = "Message must be at least 10 characters.";

  return errors;
}

const CONTACT_ITEMS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email us",
    value: env.contactEmail,
    href: `mailto:${env.contactEmail}`,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Call us",
    value: env.contactPhone,
    href: getContactPhoneTelHref(),
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "Chat with us now",
    href: getWhatsAppUrl("Hello 360 Tours, I would like to plan a trip to Ghana."),
    external: true,
    accent: true,
  },
];

const HUBS = [
  { code: "GH", name: "Accra, Ghana", desc: "West Africa operations" },
  { code: "NL", name: "Amsterdam, Netherlands", desc: "European operations" },
  { code: "KE", name: "Nairobi, Kenya", desc: "East Africa operations" },
  { code: "ZA", name: "Cape Town, South Africa", desc: "Southern Africa operations" },
];

const FAQS = [
  { q: "How far in advance should I book?", a: "We recommend at least 6 to 8 weeks for group tours and 4 weeks for individual trips, especially for peak season departures (June to September, December)." },
  { q: "Do you handle flights?", a: "We can assist with flight coordination and hotel bookings as part of a full package, or work alongside your existing travel arrangements." },
  { q: "What group sizes do you accommodate?", a: "We work with groups from 6 to 200+ travelers: universities, corporations, family reunions, and everything in between." },
  { q: "Is travel insurance included?", a: "Travel insurance is not included by default but we strongly recommend it and can connect you with trusted providers." },
  { q: "Do you offer visa on arrival assistance?", a: "Yes. We guide eligible travelers through Ghana's visa on arrival process, including required documents, fees, and airport procedures for a smooth entry." },
];

function InputField({ label, id, type = "text", required, placeholder, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-brand-ink">
        {label}{required && <span className="ml-0.5 text-brand-orange">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={[
          "h-11 w-full rounded-xl border bg-white px-4 text-sm text-brand-ink placeholder:text-brand-muted/60 shadow-sm outline-none transition-all focus:ring-2",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-brand-border/70 focus:border-brand-green/50 focus:ring-brand-green/15",
        ].join(" ")}
      />
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...rise(index * 0.07)} className="border-b border-brand-border/50 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-brand-ink hover:text-brand-green"
      >
        {faq.q}
        <svg
          className={`h-4 w-4 shrink-0 text-brand-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="pb-4 text-sm leading-relaxed text-brand-muted"
        >
          {faq.a}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function ContactPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function resetForm() {
    setForm(getInitialForm(user));
    setErrors({});
    setSubmitted(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateContactForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      fullname: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      type: form.inquiry,
    };

    const phone = normalizePhoneForApi(form.phone);
    if (phone) payload.phone_number = phone;

    setLoading(true);
    const result = await contactsServiceApi.submitContact(payload, { token: isAuthenticated ? token : null });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message || "Could not send your message. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success(result.reason || result.message || "Contact submitted");
  }

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden bg-brand-green py-14 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%23ffffff' fill-opacity='0.04'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.04'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "28px 28px" }} />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

        <Container className="relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-gold backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              Get in touch
            </span>
            <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Let&apos;s plan your journey
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
              Whether you&apos;re organizing a university trip, corporate retreat, or solo adventure, our team responds within 24 hours.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ── Main content ── */}
      <section className="bg-brand-cream py-14 sm:py-18">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

            {/* ── Left: Contact form ── */}
            <motion.div {...rise()}>
              <div className="overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-[0_16px_48px_-20px_rgba(28,43,38,0.25)]">
                <div className="border-b border-brand-border/40 px-7 py-5">
                  <h2 className="text-lg font-bold text-brand-ink">Send us a message</h2>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    We&apos;ll get back to you within one business day.
                    {isAuthenticated ? " Your account details are pre-filled — edit them if needed." : ""}
                  </p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center justify-center px-7 py-16 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10">
                      <svg className="h-7 w-7 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-brand-ink">Message sent!</h3>
                    <p className="mt-2 max-w-xs text-sm text-brand-muted">
                      Thank you, {form.name.split(" ")[0] || "traveler"}. We&apos;ll be in touch within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-6 text-sm font-semibold text-brand-green underline underline-offset-2"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 px-7 py-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField label="Full name" id="name" required placeholder="Jane Doe" value={form.name} onChange={update("name")} error={errors.name} />
                      <InputField label="Email address" id="email" type="email" required placeholder="jane@example.com" value={form.email} onChange={update("email")} error={errors.email} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField label="Phone (optional)" id="phone" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={update("phone")} />
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="inquiry" className="text-xs font-semibold text-brand-ink">
                          Inquiry type<span className="ml-0.5 text-brand-orange">*</span>
                        </label>
                        <select
                          id="inquiry"
                          required
                          value={form.inquiry}
                          onChange={update("inquiry")}
                          className={[
                            "h-11 w-full rounded-xl border bg-white px-4 text-sm text-brand-ink shadow-sm outline-none transition-all focus:ring-2",
                            errors.inquiry
                              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                              : "border-brand-border/70 focus:border-brand-green/50 focus:ring-brand-green/15",
                          ].join(" ")}
                        >
                          <option value="" disabled>Select type…</option>
                          {INQUIRY_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {errors.inquiry ? <p className="text-xs font-medium text-red-500">{errors.inquiry}</p> : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-xs font-semibold text-brand-ink">
                        Message<span className="ml-0.5 text-brand-orange">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        required
                        placeholder="Tell us about your group size, desired dates, countries of interest, and any special requirements…"
                        value={form.message}
                        onChange={update("message")}
                        className={[
                          "w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-muted/60 shadow-sm outline-none transition-all focus:ring-2",
                          errors.message
                            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                            : "border-brand-border/70 focus:border-brand-green/50 focus:ring-brand-green/15",
                        ].join(" ")}
                      />
                      {errors.message ? <p className="text-xs font-medium text-red-500">{errors.message}</p> : null}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(45,90,71,0.5)] transition-all hover:bg-brand-green/90 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── Right: Info panel ── */}
            <div className="flex flex-col gap-6">

              {/* Contact methods */}
              <motion.div {...rise(0.1)} className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-sm">
                <div className="border-b border-brand-border/40 px-6 py-4">
                  <h2 className="text-base font-bold text-brand-ink">Reach us directly</h2>
                </div>
                <div className="divide-y divide-brand-border/30">
                  {CONTACT_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className={[
                        "group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-brand-cream",
                        item.accent ? "bg-green-50/60" : "",
                      ].join(" ")}
                    >
                      <span className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        item.accent
                          ? "bg-green-500/15 text-green-600"
                          : "bg-brand-green/8 text-brand-green group-hover:bg-brand-green/15",
                      ].join(" ")}>
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-xs text-brand-muted">{item.label}</p>
                        <p className={`text-sm font-semibold ${item.accent ? "text-green-700" : "text-brand-ink"}`}>{item.value}</p>
                      </div>
                      <svg className="ml-auto h-4 w-4 text-brand-muted opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Hub offices */}
              <motion.div {...rise(0.15)} className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-sm">
                <div className="border-b border-brand-border/40 px-6 py-4">
                  <h2 className="text-base font-bold text-brand-ink">Our offices</h2>
                </div>
                <div className="grid grid-cols-2 gap-px bg-brand-border/30">
                  {HUBS.map((h) => (
                    <div key={h.name} className="bg-white px-5 py-4">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-cream text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                        {h.code}
                      </span>
                      <p className="mt-1.5 text-xs font-bold text-brand-ink">{h.name}</p>
                      <p className="text-[11px] text-brand-muted">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...rise(0.18)} className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-sm">
                <div className="border-b border-brand-border/40 px-6 py-4">
                  <h2 className="text-base font-bold text-brand-ink">Follow us</h2>
                </div>
                <div className="px-6 py-5">
                  <SocialLinks />
                  <p className="mt-3 text-xs text-brand-muted">Connect on Instagram or chat with us on WhatsApp.</p>
                </div>
              </motion.div>

              {/* Response time badge */}
              <motion.div {...rise(0.2)} className="flex items-center gap-3 rounded-2xl border border-brand-green/20 bg-brand-green/8 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-green">We respond within 24 hours</p>
                  <p className="text-xs text-brand-muted">Mon–Fri · 9am – 6pm EST &amp; GMT</p>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <motion.div {...rise()} className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">FAQ</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-ink sm:text-3xl">Common questions</h2>
            </motion.div>
            <div className="rounded-[1.5rem] border border-brand-border/60 bg-white px-6 py-2 shadow-sm">
              {FAQS.map((faq, i) => (
                <FaqItem key={faq.q} faq={faq} index={i} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
