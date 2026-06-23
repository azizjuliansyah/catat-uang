"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerWaiting {
  waiting: ServiceWorker;
  updateReady: boolean;
}

export function useServiceWorkerUpdate() {
  const [waitingServiceWorker, setWaitingServiceWorker] =
    useState<ServiceWorkerWaiting | null>(null);

  useEffect(() => {
    // Listen for service worker update
    const listener = (event: Event) => {
      const sw = event.target as ServiceWorker;
      setWaitingServiceWorker({
        waiting: sw,
        updateReady: true,
      });
    };

    // Check for waiting service worker on mount
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setWaitingServiceWorker({
            waiting: registration.waiting,
            updateReady: true,
          });
        }

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingServiceWorker({
                  waiting: newWorker,
                  updateReady: true,
                });
              }
            });
          }
        });

        // Listen for waiting service worker
        registration.addEventListener("controllerchange", () => {
          // Reload when controller changes (after update)
          window.location.reload();
        });
      });
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.removeEventListener("updatefound", () => {});
            registration.removeEventListener("controllerchange", () => {});
          }
        });
      }
    };
  }, []);

  return waitingServiceWorker;
}

export function PWAUpdatePrompt() {
  const updateAvailable = useServiceWorkerUpdate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (updateAvailable?.updateReady) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    if (updateAvailable?.waiting) {
      // Send message to waiting service worker to skip waiting
      updateAvailable.waiting.postMessage({ type: "SKIP_WAITING" });
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-surface-card border border-border-strong rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary text-sm">
              Update Available
            </h3>
            <p className="text-text-secondary text-xs mt-1">
              A new version of CatatUang is ready. Update to get the latest features and improvements.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-surface-hover hover:bg-surface-input text-text-primary text-xs font-medium rounded-md transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
