const LINKS = ["Email", "GitHub", "LinkedIn", "Résumé ↓"];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-[60px] px-[clamp(28px,6vw,90px)] bg-[#f7f3ec] flex flex-col items-center gap-[14px] text-center"
    >
      <div className="text-[26px] font-newsreader text-[#2e2a24]">
        Let&apos;s build something that lasts.
      </div>
      <div className="flex gap-[22px] text-[12px] font-medium font-grotesk mt-1">
        {LINKS.map((l) => (
          <a key={l} href="#" className="!text-[#5c5346]">
            {l}
          </a>
        ))}
      </div>
      <div className="text-[10.5px] font-plex-mono text-[#b3a794] mt-[18px]">
        © 2026 John Glen Siy · visitor #68
      </div>
    </section>
  );
}
