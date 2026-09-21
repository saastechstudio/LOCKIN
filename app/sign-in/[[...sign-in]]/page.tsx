import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-noise px-4 py-16">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              card: "glass shadow-2xl",
              headerTitle: "font-serif text-foreground",
              formButtonPrimary:
                "bg-gradient-to-b from-brand-gold-soft to-brand-gold text-black hover:brightness-110",
            },
          }}
        />
      </div>
    </main>
  );
}
