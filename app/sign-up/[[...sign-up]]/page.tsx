import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-noise px-4 py-16">
      <div className="w-full max-w-md">
        <SignUp
          forceRedirectUrl="/onboarding"
          appearance={{
            elements: {
              card: "surface",
              headerTitle: "font-display text-foreground",
              formButtonPrimary:
                "bg-brand-gradient text-white rounded-full hover:brightness-105",
            },
          }}
        />
      </div>
    </main>
  );
}
