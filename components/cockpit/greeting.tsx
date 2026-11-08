"use client";

import { useEffect, useState } from "react";

/** Salutation à l'heure locale du membre (le serveur ne la connaît pas). */
export function Greeting({ firstName }: { firstName: string }) {
  const [hello, setHello] = useState("Bonjour");
  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHello(h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir");
  }, []);
  return (
    <>
      {hello}, {firstName}
    </>
  );
}
