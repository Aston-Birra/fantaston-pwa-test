
/* ==========================================
   FANTASTON MANAGER - PWA UPDATES
   ========================================== */

(() => {
  if (!("serviceWorker" in navigator)) return;

  let updateRequested = false;
  let reloading = false;

  // NOTIFICA GRAFICA AGGIORNAMENTO
  function showUpdateBanner(registration) {
    if (!registration.waiting) return;

    // Non mostrare durante la prima installazione
    if (!navigator.serviceWorker.controller) return;

    // Evita notifiche duplicate
    if (document.getElementById("fantaston-update-banner")) {
      return;
    }

    const banner = document.createElement("div");
    banner.id = "fantaston-update-banner";

    Object.assign(banner.style, {
      position: "fixed",
      left: "12px",
      right: "12px",
      bottom: "calc(82px + env(safe-area-inset-bottom, 0px))",
      zIndex: "99999",
      maxWidth: "420px",
      margin: "0 auto",
      padding: "16px",
      background: "#211B14",
      border: "1px solid #6C5127",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0,0,0,.45)",
      fontFamily: "Manrope, sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    });

    const title = document.createElement("strong");
    title.textContent = "Aggiornamento disponibile";

    Object.assign(title.style, {
      color: "#F6F2E9",
      fontSize: "14px"
    });

    const description = document.createElement("span");
    description.textContent =
      "Una nuova versione di FANTASTON è pronta.";

    Object.assign(description.style, {
      color: "#AAA398",
      fontSize: "12px"
    });

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Aggiorna adesso";

    Object.assign(button.style, {
      width: "100%",
      padding: "12px",
      background: "#E4BB69",
      color: "#211B14",
      border: "none",
      borderRadius: "20px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer"
    });

    button.addEventListener("click", () => {
      if (!registration.waiting) return;

      updateRequested = true;
      button.disabled = true;
      button.textContent = "Aggiornamento in corso...";

      registration.waiting.postMessage({
        type: "SKIP_WAITING"
      });
    });

    banner.append(title, description, button);
    document.body.append(banner);
  }

  // LA NUOVA VERSIONE HA PRESO IL CONTROLLO
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      if (!updateRequested || reloading) return;

      reloading = true;
      window.location.reload();
    }
  );

  // REGISTRAZIONE SERVICE WORKER
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./sw.js", {
          scope: "./"
        });

      console.log(
        "[FANTASTON] Service Worker attivo:",
        registration.scope
      );

      // Aggiornamento già in attesa
      if (registration.waiting) {
        showUpdateBanner(registration);
      }

      // Rilevamento nuova versione
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed") {
            showUpdateBanner(registration);
          }
        });
      });

      // Controlla eventuali aggiornamenti all'avvio
      if (navigator.serviceWorker.controller) {
        registration.update().catch(console.warn);
      }

      // Controlla quando l'utente riapre l'app
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update().catch(console.warn);
        }
      });

    } catch (error) {
      console.error(
        "[FANTASTON] Errore registrazione PWA:",
        error
      );
    }
  });
})();
