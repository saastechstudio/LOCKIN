"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

// Catches failures in the root layout itself (e.g. a misconfigured
// provider) — must render its own <html>/<body> since it replaces the
// entire root layout, and stays deliberately dependency-light.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0F1826",
          color: "#FAF9F7",
        }}
      >
        <AlertTriangle size={40} color="#D97A5A" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Lock In est momentanément indisponible
        </h1>
        <p style={{ maxWidth: "24rem", color: "#B8B3AE", fontSize: "0.875rem" }}>
          Une erreur inattendue empêche le chargement de
          l&apos;application. Réessaie dans un instant.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "9999px",
            background: "#3E5C8A",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
