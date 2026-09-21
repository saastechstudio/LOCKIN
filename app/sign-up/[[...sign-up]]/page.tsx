import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-noise px-4 py-16">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              card: "surface",
              headerTitle: "font-display text-foreground",
              formButtonPrimary:
                "bg-brand-blue text-white rounded-full hover:bg-brand-blue-deep",
            },
          }}
        />
      </div>
    </main>
  );
}
