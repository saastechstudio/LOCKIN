import { Suspense } from "react";
import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="camp-scope flex min-h-screen flex-col">
      <header className="border-b border-camp-hairline">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
          <Link
            href="/"
            className="text-xs font-bold tracking-[0.14em] whitespace-nowrap text-camp-charcoal uppercase sm:text-sm sm:tracking-[0.18em]"
          >
            Lockin Social Club
          </Link>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-5 py-16 sm:py-24">
        <div className="w-full max-w-md">
          {/* useSearchParams (redirect_url) exige une frontière Suspense. */}
          <Suspense>
            <SignUpForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
