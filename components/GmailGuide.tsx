import Image from "next/image";

const guideContent = {
  presale: {
    title: "Using Gmail? Make Sure You Don't Miss Your Presale Email",
    description:
      "Gmail may place CMMS Early Access emails in the Promotions tab. Here's how to move our message to Primary so future emails are easier to find.",
  },
  mailingList: {
    title: "A Quick Tip for Gmail Users",
    description:
      "Gmail may place CMMS emails in Promotions. This quick guide shows how to move us to Primary for future messages.",
  },
} as const;

export function GmailGuide({
  variant,
}: {
  variant: keyof typeof guideContent;
}) {
  const content = guideContent[variant];

  return (
    <section
      id={variant === "presale" ? "gmail-help" : undefined}
      className="mx-auto mt-8 w-full max-w-6xl scroll-mt-28 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-4 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6 lg:p-8"
    >
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">
        {content.title}
      </h2>
      <p className="mx-auto mt-3 max-w-3xl leading-7 text-[#d9c8aa]">
        {content.description}
      </p>
      <a
        href="/images/emailstuff.png"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block overflow-hidden rounded-lg border border-[#d7a84f]/30 focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#120d08]"
        aria-label="Open the Gmail presale email guide at full size"
      >
        <Image
          src="/images/emailstuff.png"
          alt="How to find a CMMS presale email in Gmail Promotions and move future CMMS emails to Primary"
          width={1731}
          height={909}
          sizes="(min-width: 1200px) 1080px, (min-width: 640px) calc(100vw - 96px), calc(100vw - 48px)"
          className="h-auto w-full object-contain"
        />
      </a>
      <p className="mt-3 text-xs text-[#bda987] sm:hidden">
        Tap the guide to open it at full size.
      </p>
    </section>
  );
}
