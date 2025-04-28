// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Automatically adds games with Trading Cards from the Steam Discovery Queue to your wishlist if not already added.
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg
// @match        *://store.steampowered.com/app/*
// @match        *://store.steampowered.com/explore*
// @match        *://store.steampowered.com/explore/
// @match        *://store.steampowered.com/curator/*
// @match        *://steamcommunity.com/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // --- START: Age Verification Skip ---
  console.log("[Steam Wishlist Looper] Running Age Skip logic...");
  try {
    // Set up 1 year cookies to bypass age verification
    const cookieOptions = "; Secure; Path=/; Max-Age=31536000; SameSite=None";

    // This cookie bypasses the "mature content - view page/cancel" screen.
    // It works on both community and the store.
    document.cookie = "wants_mature_content=1" + cookieOptions;

    if (location.hostname === "store.steampowered.com") {
      // This cookie bypasses the "enter your date of birth" screen.
      const twentyFiveYearsAgo = (
        (Date.now() - 788_400_000_000) /
        1000
      ).toFixed();
      document.cookie = "birthtime=" + twentyFiveYearsAgo + cookieOptions;

      // Reload after making sure we're actually on a page with an age gate
      window.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("app_agegate")) {
          console.log(
            "[Steam Age Skip] Age gate detected on store. Reloading..."
          );
          location.reload();
        }
      });
    } else if (location.hostname === "steamcommunity.com") {
      window.addEventListener("DOMContentLoaded", () => {
        const ageCheck = document.querySelector(".agegate_text_container");
        if (ageCheck) {
          console.log(
            "[Steam Age Skip] Age gate detected on community. Attempting to proceed..."
          );
          const proceed = function (context = window) {
            // Check for common functions used by Steam to bypass gates
            if (typeof context.Proceed !== "undefined") {
              console.log("[Steam Age Skip] Calling Proceed()...");
              context.Proceed();
              return true;
            }
            if (typeof context.AcceptAppHub !== "undefined") {
              console.log("[Steam Age Skip] Calling AcceptAppHub()...");
              context.AcceptAppHub();
              return true;
            }
            // Add other potential function names here if needed
            console.log(
              "[Steam Age Skip] Could not find Proceed or AcceptAppHub function."
            );
            return false;
          };

          let executed = false;
          if ("wrappedJSObject" in window) {
            // Firefox sandbox, bypass and execute directly
            console.log("[Steam Age Skip] Using wrappedJSObject (Firefox)...");
            executed = proceed(window.wrappedJSObject);
          }

          // Always try injecting script as a fallback or primary for other browsers
          if (!executed) {
            console.log("[Steam Age Skip] Injecting script tag...");
            const script = document.createElement("script");
            // Make the injected script try to call the functions
            script.textContent = `"use strict"; (function() {
                  console.log("[Steam Age Skip - Injected] Trying to proceed...");
                  if (typeof window.Proceed !== 'undefined') {
                      console.log("[Steam Age Skip - Injected] Calling Proceed()...");
                      window.Proceed();
                  } else if (typeof window.AcceptAppHub !== 'undefined') {
                      console.log("[Steam Age Skip - Injected] Calling AcceptAppHub()...");
                      window.AcceptAppHub();
                  } else {
                      console.log("[Steam Age Skip - Injected] No known function found.");
                  }
              })();`;
            (document.head ?? document.documentElement).prepend(script);
            // Clean up the injected script tag
            setTimeout(() => script.remove(), 10);
          }
        }
      });
    }
  } catch (e) {
    console.error("[Steam Age Skip] Error:", e);
  }
  // --- END: Age Verification Skip ---

  // --- Wishlist Looper Configuration ---
  const CHECK_INTERVAL_MS = 3500;
  const ACTION_DELAY_MS = 1800;
  const AUTO_START_KEY = "wishlistLooperAutoStart";
  const AUTO_RESTART_QUEUE_KEY = "wishlistLooperAutoRestartQueue";

  // --- Wishlist Looper Selectors ---
  const SELECTORS = {
    wishlistArea: "#add_to_wishlist_area",
    addToWishlistButton: "#add_to_wishlist_area .add_to_wishlist",
    isWishlistedIndicator: "#add_to_wishlist_area_success",
    tradingCardsIndicator: 'a[href*="/tradingcards/"]',
    nextButton: ".btn_next_in_queue_trigger",
    nextForm: "#next_in_queue_form",
    ignoreButton: "#ignoreBtn .queue_btn_ignore .queue_btn_inactive",
    queueFinishedIndicator: ".discover_queue_empty",
    gameTitle: ".apphub_AppName",
    queueRemainingText: ".queue_sub_text",
    queueStartLink:
      ".discovery_queue_start_link, #discovery_queue_start_link, .discovery_queue_winter_sale_cards_header a[href*='iscovery_queue']",
    startAnotherQueueButton:
      "#refresh_queue_btn, .discover_queue_empty_refresh_btn .btnv6_lightblue_blue, .discovery_queue_empty a[href*='discoveryqueue'], .begin_exploring",
    queueContainer: "#discovery_queue_ctn",
    queueEmptyContainer: ".discover_queue_empty",
  };

  // --- Wishlist Looper State ---
  let intervalId = null;
  let isProcessing = false;
  let autoStartEnabled = GM_getValue(AUTO_START_KEY, false);
  let autoRestartQueueEnabled = GM_getValue(AUTO_RESTART_QUEUE_KEY, true);

  // --- Wishlist Looper Logging ---
  function log(message) {
    // Avoid duplicate logging prefix if age skip already added one
    if (!message.startsWith("[Steam")) {
      console.log("[Steam Wishlist Looper]", message);
    } else {
      console.log(message); // Log directly if it already has a prefix
    }
  }

  // --- Wishlist Looper Core Logic ---
  async function processQueueItem() {
    if (isProcessing) return;
    isProcessing = true;

    // Check if queue is finished
    const queueEmptyContainer = document.querySelector(
      SELECTORS.queueEmptyContainer
    );

    if (queueEmptyContainer && queueEmptyContainer.style.display !== "none") {
      log("Discovery Queue finished or empty.");

      // If auto-restart is enabled, try to start a new queue
      if (autoStartEnabled && autoRestartQueueEnabled) {
        log("Auto-restart enabled. Attempting to start a new queue...");
        generateNewQueue(); // This now returns boolean but we don't need to check it here

        setTimeout(() => {
          isProcessing = false;
        }, 2000); // Give time for queue generation attempt
        return;
      } else {
        log("Auto-restart not enabled. Stopping loop.");
        stopLoop();
        isProcessing = false;
        return;
      }
    }

    // Check if we're on explore page (and not in a queue yet)
    const isOnExplorePage = window.location.pathname.includes("/explore");
    const queueContainer = document.querySelector(SELECTORS.queueContainer);
    const queueStartLink = document.querySelector(SELECTORS.queueStartLink);
    const startAnotherQueueButton = document.querySelector(
      SELECTORS.startAnotherQueueButton
    );

    if (
      isOnExplorePage &&
      (!queueContainer || queueContainer.style.display === "none") &&
      !window.location.pathname.includes("/next")
    ) {
      log("On explore page, queue not active.");
      if (autoStartEnabled && autoRestartQueueEnabled) {
        if (queueStartLink) {
          log("Found queue start link. Starting new queue...");
          queueStartLink.click();
          isProcessing = false;
          return;
        } else if (startAnotherQueueButton) {
          log("Found 'start another queue' button. Clicking...");
          startAnotherQueueButton.click();
          isProcessing = false;
          return;
        } else {
          log(
            "Could not find a way to start queue from explore page. Attempting generation..."
          );
          generateNewQueue();
          setTimeout(() => {
            isProcessing = false;
          }, 1500);
          return;
        }
      } else {
        log("Auto start/restart disabled, stopping.");
        stopLoop();
        isProcessing = false;
        return;
      }
    }

    // --- Continue processing actual queue item ---
    const wishlistArea = document.querySelector(SELECTORS.wishlistArea);
    const wishlistedIndicator = document.querySelector(
      SELECTORS.isWishlistedIndicator
    );
    const nextButton = document.querySelector(SELECTORS.nextButton);
    const ignoreButton = document.querySelector(SELECTORS.ignoreButton); // Corrected selector slightly
    const gameTitleElement = document.querySelector(SELECTORS.gameTitle);
    const gameTitle = gameTitleElement
      ? gameTitleElement.textContent.trim()
      : "Unknown Game";

    // Get remaining queue count if available
    const queueRemainingElement = document.querySelector(
      SELECTORS.queueRemainingText
    );
    const queueRemaining = queueRemainingElement
      ? queueRemainingElement.textContent.trim()
      : "";

    // Need the wishlist area and at least one button to advance the queue
    if (!wishlistArea || (!nextButton && !ignoreButton)) {
      log(
        `Missing critical elements (wishlist area or next/ignore button) for ${gameTitle}. Stopping check for this cycle.`
      );
      isProcessing = false;
      return;
    }

    // Check if already wishlisted
    const isWishlisted =
      wishlistedIndicator && wishlistedIndicator.style.display !== "none";

    const addToWishlistButton = document.querySelector(
      SELECTORS.addToWishlistButton
    );
    const hasTradingCards = document.querySelector(
      SELECTORS.tradingCardsIndicator
    );

    let actionTaken = false;
    let advanceAction = "None";

    log(
      `Processing: ${gameTitle} ${queueRemaining ? "- " + queueRemaining : ""}`
    );

    if (hasTradingCards) {
      log(` -> Has Trading Cards.`);
      if (!isWishlisted && addToWishlistButton) {
        log(` -> Not on wishlist. Adding...`);
        addToWishlistButton.click();
        actionTaken = true;
        await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY_MS));
      } else if (isWishlisted) {
        log(` -> Already on wishlist.`);
      } else {
        log(
          ` -> Could not find 'Add to Wishlist' button (maybe DLC/ignored?). Skipping add.`
        );
      }
    } else {
      log(` -> No Trading Cards detected.`);
    }

    // Decide how to advance
    if (nextButton && nextButton.offsetParent !== null) {
      // Check if visible
      advanceAction = "Next";
    } else if (ignoreButton && ignoreButton.offsetParent !== null) {
      // Check if visible
      advanceAction = "Ignore";
    } else {
      // Fallback: Sometimes the 'next' button is hidden but still functional via form submit
      const nextForm = document.querySelector(SELECTORS.nextForm);
      if (nextForm) {
        log(" -> Next/Ignore button not visible, trying form submission...");
        advanceAction = "FormSubmit";
      } else {
        advanceAction = "Stop";
      }
    }

    // Add a small delay before advancing if no specific action was taken
    if (
      !actionTaken &&
      advanceAction !== "Stop" &&
      advanceAction !== "FormSubmit"
    ) {
      await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY_MS / 3));
    }

    // Execute advance action
    if (advanceAction === "Next") {
      log(" -> Clicking 'Next in Queue'...");
      nextButton.click();
    } else if (advanceAction === "Ignore") {
      log(" -> Clicking 'Ignore' to advance queue...");
      ignoreButton.click();
    } else if (advanceAction === "FormSubmit") {
      const nextForm = document.querySelector(SELECTORS.nextForm);
      if (nextForm && typeof nextForm.submit === "function") {
        log(" -> Submitting next_in_queue_form...");
        nextForm.submit();
      } else {
        log(" -> Cannot find form to submit. Stopping.");
        stopLoop();
      }
    } else {
      log(
        " -> Cannot advance queue (no visible Next/Ignore button or form). Stopping."
      );
      stopLoop();
    }

    // Release processing lock
    setTimeout(() => {
      isProcessing = false;
    }, ACTION_DELAY_MS / 2); // Shorter delay after action
  }

  // --- Wishlist Looper Control Functions ---
  function startLoop() {
    if (intervalId) {
      log("Loop already running.");
      return;
    }
    log("Starting loop...");
    isProcessing = false; // Reset processing state
    // Initial check immediate, then interval
    setTimeout(() => {
      if (!intervalId) {
        // Check again in case stop was called quickly
        processQueueItem();
        // Ensure interval isn't set multiple times
        if (!intervalId) {
          intervalId = setInterval(processQueueItem, CHECK_INTERVAL_MS);
        }
      }
    }, 500); // Short delay before first check
    updateUI(true);
  }

  function stopLoop() {
    if (!intervalId) {
      // log("Loop already stopped."); // Optional: uncomment for verbose logging
      return;
    }
    log("Stopping loop...");
    clearInterval(intervalId);
    intervalId = null;
    isProcessing = false; // Reset processing state
    updateUI(false);
  }

  function toggleAutoStart() {
    autoStartEnabled = !autoStartEnabled;
    GM_setValue(AUTO_START_KEY, autoStartEnabled);
    log(`Auto-start ${autoStartEnabled ? "enabled" : "disabled"}.`);
    updateUI(!!intervalId);
    alert(
      `Wishlist Looper auto-start is now ${autoStartEnabled ? "ON" : "OFF"}.`
    );
  }

  function toggleAutoRestartQueue() {
    autoRestartQueueEnabled = !autoRestartQueueEnabled;
    GM_setValue(AUTO_RESTART_QUEUE_KEY, autoRestartQueueEnabled);
    log(
      `Auto-restart queue ${autoRestartQueueEnabled ? "enabled" : "disabled"}.`
    );
    updateUI(!!intervalId);
    alert(
      `Auto-restart queue is now ${autoRestartQueueEnabled ? "ON" : "OFF"}.`
    );
  }

  // --- Wishlist Looper Queue Generation ---
  function generateNewQueue() {
    log("Attempting to generate a new queue...");
    let generated = false;

    // Method 0: Click explicit "Start another queue" button if visible
    const startAnotherBtn = document.querySelector(
      SELECTORS.startAnotherQueueButton
    );
    if (startAnotherBtn && startAnotherBtn.offsetParent !== null) {
      log(" -> Clicking 'Start Another Queue' button...");
      startAnotherBtn.click();
      generated = true;
      return true; // Assume success, page will likely reload/update
    }

    // Method 1: Try using Steam's DiscoveryQueue directly
    try {
      if (
        typeof DiscoveryQueue !== "undefined" &&
        typeof DiscoveryQueue.GenerateNewQueue === "function"
      ) {
        log(" -> Found DiscoveryQueue object, calling GenerateNewQueue()");
        DiscoveryQueue.GenerateNewQueue();
        generated = true;
        // Make queue visible if hidden after generation (common issue)
        setTimeout(ensureQueueVisible, 1000);
        return true;
      }
    } catch (e) {
      log(` -> Error calling DiscoveryQueue.GenerateNewQueue(): ${e.message}`);
    }

    // Method 2: Try using jQuery if available ($J is common on Steam pages)
    if (!generated) {
      try {
        const refreshBtnJ =
          typeof $J !== "undefined" && $J("#refresh_queue_btn");
        if (refreshBtnJ && refreshBtnJ.length > 0) {
          log(" -> Using jQuery to trigger queue refresh button");
          refreshBtnJ.click();
          generated = true;
          setTimeout(ensureQueueVisible, 1000);
          return true;
        }
      } catch (e) {
        log(` -> Error using jQuery for refresh: ${e.message}`);
      }
    }

    // Method 3: Regular click on refresh button by ID
    if (!generated) {
      const refreshBtn = document.getElementById("refresh_queue_btn");
      if (refreshBtn && refreshBtn.offsetParent !== null) {
        log(" -> Clicking refresh button by ID");
        refreshBtn.click();
        generated = true;
        setTimeout(ensureQueueVisible, 1000);
        return true;
      }
    }

    // Method 4: If queue seems generated but hidden, try clicking the start link inside it
    if (!generated) {
      const startLink = document.querySelector(SELECTORS.queueStartLink);
      const queueContainer = document.querySelector(SELECTORS.queueContainer);
      // Check if queue container exists but might be hidden, and start link is present
      if (queueContainer && startLink) {
        log(
          " -> Found queue container and start link, attempting to click start link..."
        );
        startLink.click();
        generated = true;
        ensureQueueVisible(); // Try to make it visible immediately
        return true;
      }
    }

    // Method 5: Navigate to explore page as a last resort
    if (!generated) {
      log(
        " -> All queue generation methods failed. Navigating to explore page..."
      );
      window.location.href = "https://store.steampowered.com/explore/";
      stopLoop(); // Stop looper since we are navigating away
      return false; // Indicate failure/navigation
    }

    return false; // Should not be reached if any method succeeded
  }

  // Helper function to try and make queue visible after generation
  function ensureQueueVisible() {
    const queueContainer = document.querySelector(SELECTORS.queueContainer);
    const queueEmptyContainer = document.querySelector(
      SELECTORS.queueEmptyContainer
    );

    if (queueContainer && queueEmptyContainer) {
      if (queueContainer.style.display === "none") {
        log(" -> Ensuring queue container is visible...");
        queueEmptyContainer.style.display = "none";
        queueContainer.style.display = ""; // Reset display
      }
    }
    // Also try clicking start link again, just in case generation finished but didn't auto-start
    const startLink = document.querySelector(SELECTORS.queueStartLink);
    if (startLink && startLink.offsetParent !== null) {
      log(
        " -> Clicking potentially visible start link after ensuring visibility..."
      );
      startLink.click();
    }
  }

  // --- Wishlist Looper UI ---
  function addControls() {
    // Avoid adding controls multiple times
    if (document.getElementById("wishlist-looper-controls")) {
      return;
    }

    const controlDiv = document.createElement("div");
    controlDiv.innerHTML = `
          <div id="wishlist-looper-controls" style="position: fixed; bottom: 10px; right: 10px; z-index: 9999; background: rgba(27, 40, 56, 0.9); color: #c7d5e0; padding: 10px; border-radius: 5px; font-family: 'Motiva Sans', sans-serif; font-size: 12px; border: 1px solid #000; box-shadow: 0 0 10px rgba(0,0,0,0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);">
            <strong style="color: #66c0f4; display: block; margin-bottom: 5px; text-shadow: 1px 1px 1px #000;">Wishlist Looper</strong>
            <button id="wl-start" style="margin-right: 5px; padding: 4px 8px; background-color: #68932f; color: white; border: 1px solid #3a511b; border-radius: 2px; cursor: pointer; font-size: 11px;">Start</button>
            <button id="wl-stop" style="margin-right: 10px; padding: 4px 8px; background-color: #a33e29; color: white; border: 1px solid #5c2416; border-radius: 2px; cursor: pointer; font-size: 11px;" disabled>Stop</button>
            <div id="wl-status" style="display: inline-block; font-size: 11px; vertical-align: middle; padding: 4px 0;">Status: Stopped</div>
            <div style="margin-top: 8px; border-top: 1px solid rgba(199, 213, 224, 0.2); padding-top: 8px;">
              <label title="Automatically start the looper when visiting a compatible Steam page." style="display: inline-flex; align-items: center; cursor: pointer; margin-right: 10px;">
                <input type="checkbox" id="wl-autostart" style="margin-right: 4px; vertical-align: middle; cursor: pointer;"> Auto-Start
              </label>
              <label title="Automatically try to generate and start a new discovery queue when the current one finishes." style="display: inline-flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="wl-autorestart" style="margin-right: 4px; vertical-align: middle; cursor: pointer;"> Auto-Restart Queue
              </label>
            </div>
          </div>
        `;
    document.body.appendChild(controlDiv);

    GM_addStyle(`
          #wishlist-looper-controls button:disabled {
            background-color: #555 !important;
            color: #999 !important;
            cursor: not-allowed !important;
            border-color: #333 !important;
          }
          #wishlist-looper-controls button:hover:not(:disabled) {
            filter: brightness(1.15);
          }
          #wl-status.running {
            color: #a1dd4a; /* Bright green */
            font-weight: bold;
            text-shadow: 1px 1px 1px #000;
          }
          #wl-status.stopped {
            color: #ff7a7a; /* Lighter red */
            font-weight: normal;
          }
          #wishlist-looper-controls input[type="checkbox"] {
             accent-color: #66c0f4; /* Steam blue for checkbox */
          }
        `);

    document.getElementById("wl-start").addEventListener("click", startLoop);
    document.getElementById("wl-stop").addEventListener("click", stopLoop);
    document
      .getElementById("wl-autostart")
      .addEventListener("change", toggleAutoStart);
    document
      .getElementById("wl-autorestart")
      .addEventListener("change", toggleAutoRestartQueue);

    updateUI(false); // Initialize UI state
  }

  function updateUI(running) {
    const startBtn = document.getElementById("wl-start");
    const stopBtn = document.getElementById("wl-stop");
    const statusDiv = document.getElementById("wl-status");
    const autoStartCheckbox = document.getElementById("wl-autostart");
    const autoRestartCheckbox = document.getElementById("wl-autorestart");

    // Check if controls exist before trying to update
    if (
      !startBtn ||
      !stopBtn ||
      !statusDiv ||
      !autoStartCheckbox ||
      !autoRestartCheckbox
    ) {
      return;
    }

    startBtn.disabled = running;
    stopBtn.disabled = !running;
    statusDiv.textContent = `Status: ${running ? "Running..." : "Stopped"}`;
    statusDiv.className = running ? "running" : "stopped";
    autoStartCheckbox.checked = autoStartEnabled;
    autoRestartCheckbox.checked = autoRestartQueueEnabled;

    // Disable auto-restart checkbox if auto-start is off (doesn't make sense otherwise)
    // autoRestartCheckbox.disabled = !autoStartEnabled; // Optional: Keep it enabled for clarity? User choice.
  }

  // --- Wishlist Looper Initialization ---
  // Run UI/Autostart logic only in the top-level window, not in iframes
  if (window.top === window.self) {
    log(
      "Script loaded in top window. Initializing Wishlist Looper UI & potentially auto-starting."
    );

    const initializeWishlister = () => {
      addControls();

      // Determine if we should attempt to start based on current page state and settings
      const shouldAutoStart =
        autoStartEnabled &&
        (window.location.pathname.includes("/app/") || // On an app page
          window.location.pathname.includes("/explore") || // On explore page
          document.querySelector(SELECTORS.queueContainer)); // Queue container exists

      // Specifically handle being on the explore page or an empty queue page on load
      if (autoStartEnabled && autoRestartQueueEnabled) {
        const queueEmptyContainer = document.querySelector(
          SELECTORS.queueEmptyContainer
        );
        const isOnExplorePage = window.location.pathname.includes("/explore");

        if (queueEmptyContainer && queueEmptyContainer.offsetParent !== null) {
          log("Found empty queue on page load.");
          log("Auto-start and auto-restart enabled. Generating new queue...");
          setTimeout(generateNewQueue, 1000); // Delay slightly
        } else if (
          isOnExplorePage &&
          !window.location.pathname.includes("/next")
        ) {
          log("On explore page on load.");
          const queueStartLink = document.querySelector(
            SELECTORS.queueStartLink
          );
          const startAnotherQueueButton = document.querySelector(
            SELECTORS.startAnotherQueueButton
          );
          if (queueStartLink) {
            log("Found queue start link on explore page. Clicking...");
            setTimeout(() => queueStartLink.click(), 500); // Delay click slightly
          } else if (startAnotherQueueButton) {
            log(
              "Found 'start another queue' button on explore page. Clicking..."
            );
            setTimeout(() => startAnotherQueueButton.click(), 500); // Delay click slightly
          } else {
            log(
              "No start button found on explore page, attempting generation..."
            );
            setTimeout(generateNewQueue, 1000);
          }
        }
      }

      if (shouldAutoStart) {
        log("Auto-start conditions met. Starting loop.");
        // Small delay to ensure page elements (like queue buttons) are fully ready after potential redirects/loads
        setTimeout(startLoop, 1500);
      } else {
        log(
          "Auto-start conditions not met or disabled. Initializing UI as stopped."
        );
        updateUI(false); // Ensure UI reflects stopped state initially
      }
    };

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      initializeWishlister();
    } else {
      window.addEventListener("DOMContentLoaded", initializeWishlister);
    }

    // Add Tampermonkey menu commands (these work regardless of DOM state)
    GM_registerMenuCommand("Start Wishlist Looper", startLoop);
    GM_registerMenuCommand("Stop Wishlist Looper", stopLoop);
    GM_registerMenuCommand(
      "Toggle Wishlist Looper Auto-Start",
      toggleAutoStart
    );
    GM_registerMenuCommand("Toggle Auto-Restart Queue", toggleAutoRestartQueue);
  } else {
    log("Wishlist Looper running in iframe, UI/Autostart skipped.");
    // Age skip logic still runs in iframes as it's outside the top window check
  }
})();
