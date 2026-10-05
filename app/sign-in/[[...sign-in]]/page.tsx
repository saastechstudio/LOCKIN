import { SignIn } from "@clerk/nextjs";

import { Logo } from "@/components/lockin/logo";
import { SLOGAN } from "@/components/lockin/primitives";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-lk-white">
      <header className="border-b border-lk-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
          <Logo size="sm" />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 py-16 sm:py-24">
        <p className="mb-10 max-w-md text-center text-sm text-lk-black/60">{SLOGAN}</p>
        <SignIn
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "border border-lk-black shadow-none",
              cardBox: "shadow-none rounded-none",
              headerTitle: "font-display text-lk-black",
              formButtonPrimary: "bg-lk-black text-lk-white rounded-none shadow-none hover:opacity-85",
              footer: "bg-lk-white",
            },
          }}
        />
      </main>
    </div>
  );
}
