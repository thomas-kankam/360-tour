/** Live guest-style article preview for the Stories CMS form. */
export default function StoryCmsPreview({
  title = "",
  excerpt = "",
  category = "",
  country = "",
  author = "",
  authorRole = "",
  date = "",
  readTime = "",
  image = "",
  body = [],
}) {
  const initials = (author || "360")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
      <div className="border-b border-brand-border/50 bg-brand-cream/40 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">Live preview</p>
        <p className="mt-0.5 text-xs text-brand-muted">How this story will look on the public site</p>
      </div>

      <div className="relative h-40 overflow-hidden bg-brand-secondary">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/30 to-brand-ink/10" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {category ? (
            <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-brand-ink">
              {category}
            </span>
          ) : null}
          <h3 className="mt-2 text-lg font-bold leading-snug text-white">{title || "Story title"}</h3>
          <p className="mt-1 text-xs text-white/75">
            {[country, date, readTime].filter(Boolean).join(" · ") || "Meta appears here"}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-[11px] font-bold text-brand-primary">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-ink">{author || "Author"}</p>
            <p className="text-[10px] text-brand-muted">{authorRole || "Role"}</p>
          </div>
        </div>

        {excerpt ? <p className="text-sm leading-relaxed text-brand-muted">{excerpt}</p> : null}

        <div className="space-y-3 border-t border-brand-border/40 pt-3">
          {(body || []).length === 0 ? (
            <p className="text-xs text-brand-muted">Body blocks appear here as you write.</p>
          ) : (
            (body || []).slice(0, 6).map((block, index) => {
              if (block.type === "heading") {
                return (
                  <h4 key={index} className="text-sm font-bold text-brand-ink">
                    {block.text || "Heading"}
                  </h4>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote key={index} className="border-l-2 border-brand-accent pl-3 text-sm italic text-brand-ink">
                    {block.text || "Quote"}
                  </blockquote>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={index} className="space-y-1 text-xs text-brand-ink">
                    {(block.items || []).slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className={`text-sm leading-relaxed ${block.type === "lead" ? "font-medium text-brand-ink" : "text-brand-muted"}`}>
                  {block.text || "Paragraph text"}
                </p>
              );
            })
          )}
          {(body || []).length > 6 ? (
            <p className="text-[11px] font-semibold text-brand-muted">+ more blocks on the live page…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
