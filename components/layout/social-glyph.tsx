/** أيقونات سوشيال مشتركة بين الفوتر وشريط التنقل. */

export function SocialGlyph({
  socialKey,
  className,
}: {
  socialKey: string;
  className?: string;
}) {
  const k = socialKey.toLowerCase();
  if (k === "facebook") return <FacebookGlyph className={className} />;
  if (k === "instagram") return <InstagramGlyph className={className} />;
  if (k === "youtube") return <YoutubeGlyph className={className} />;
  return <ExternalGlyph className={className} />;
}

function ExternalGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M14 3h7v7" strokeLinecap="round" />
      <path d="M10 14 21 3" strokeLinecap="round" />
      <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" strokeLinecap="round" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V11H7v3h2.5v8h4z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 4 12 4 12 4s-4 0-6.7.3c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 8.9 2 10.6v1.7c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.9.2 6.6.3 6.6.3s4 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.7c0-1.7-.2-3.4-.2-3.4zM10 14.5V8.5L15.2 11.5 10 14.5z" />
    </svg>
  );
}
