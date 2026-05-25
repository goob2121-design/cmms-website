import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#080604] px-6 py-10 text-[#f8efe2] sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(191,142,62,0.25),transparent_34%),linear-gradient(135deg,rgba(15,13,10,0.78),rgba(8,6,4,0.98)_48%,rgba(38,25,12,0.9))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6a54c]/70 to-transparent" />
      <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8e6630]/60 to-transparent" />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <div className="mb-9 flex w-full justify-center">
          <div className="relative w-full max-w-[280px] sm:max-w-[360px]">
            <div className="absolute inset-8 rounded-full bg-[#d7a84f]/15 blur-3xl" />
            <Image
              src="/cmms-logo.png"
              alt="Cumberland Mountain Music"
              width={720}
              height={720}
              priority
              className="relative h-auto w-full object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.38em] text-[#d7a84f] sm:text-base">
          Home of
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
          The Cumberland Mountain Music Show
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[#e7d8c2] sm:text-xl">
          Live bluegrass, gospel, and traditional mountain music from the heart
          of Appalachia.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#f4d28b]">
            Official Website Coming Soon
          </p>
          <a
            href="https://www.pinnaclestudiotn.com/cmms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/70 bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
          >
            Visit Current Ticket Page
          </a>
        </div>
      </section>
    </main>
  );
}
