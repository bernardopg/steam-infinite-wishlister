// ==UserScript==
// @name         Steam Infinite Wishlister
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically adds games with Trading Cards from the Steam Discovery Queue to your wishlist if not already added.
// @icon         https://store.steampowered.com/favicon.ico
// @author       bernardopg
// @match        *://store.steampowered.com/app/*
// @match        *://store.steampowered.com/explore*
// @match        *://store.steampowered.com/explore/
// @match        *://store.steampowered.com/curator/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // --- Configuration ---
  const CHECK_INTERVAL_MS = 3500;
  const ACTION_DELAY_MS = 1800;
  const AUTO_START_KEY = "wishlistLooperAutoStart";
  const AUTO_RESTART_QUEUE_KEY = "wishlistLooperAutoRestartQueue";

  // --- Selectors ---
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

  // --- State ---
  let intervalId = null;
  let isProcessing = false;
  let autoStartEnabled = GM_getValue(AUTO_START_KEY, false);
  let autoRestartQueueEnabled = GM_getValue(AUTO_RESTART_QUEUE_KEY, true);

  // --- Logging ---
  function log(message) {
    console.log("[Steam Wishlist Looper]", message);
  }

  // --- Core Logic ---
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
        generateNewQueue();

        setTimeout(() => {
          isProcessing = false;
        }, 2000);
        return;
      } else {
        log("Auto-restart not enabled. Stopping loop.");
        stopLoop();
        isProcessing = false;
        return;
      }
    }

    // Check if we're on explore page
    if (window.location.href.includes("/explore")) {
      log("On explore page.");
      if (autoStartEnabled && autoRestartQueueEnabled) {
        const queueStartLink = document.querySelector(SELECTORS.queueStartLink);
        if (queueStartLink) {
          log("Found queue start link. Starting new queue...");
          queueStartLink.click();
          isProcessing = false;
          return;
        }

        // Check for the hidden queue container
        const queueContainer = document.querySelector(SELECTORS.queueContainer);
        if (queueContainer && queueContainer.style.display === "none") {
          log("Queue container is hidden. Generating new queue...");
          generateNewQueue();

          setTimeout(() => {
            isProcessing = false;
          }, 1500);
          return;
        }
      }
    }

    const wishlistArea = document.querySelector(SELECTORS.wishlistArea);
    const wishlistedIndicator = document.querySelector(
      SELECTORS.isWishlistedIndicator
    );
    const nextButton = document.querySelector(SELECTORS.nextButton);
    const ignoreButton = document.querySelector(SELECTORS.ignoreButton);
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
        log(` -> Could not find 'Add to Wishlist' button. Skipping.`);
      }
    } else {
      log(` -> No Trading Cards detected.`);
    }

    // Decide how to advance
    if (nextButton) {
      advanceAction = "Next";
    } else if (ignoreButton) {
      advanceAction = "Ignore";
    } else {
      advanceAction = "Stop";
    }

    // Add a small delay before advancing if no specific action was taken
    if (!actionTaken && advanceAction !== "Stop") {
      await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY_MS / 3));
    }

    // Execute advance action
    if (advanceAction === "Next") {
      log(" -> Clicking 'Next in Queue'...");
      nextButton.click();
    } else if (advanceAction === "Ignore") {
      log(" -> Clicking 'Ignore' to advance queue...");
      ignoreButton.click();
    } else {
      log(" -> Cannot advance queue. Stopping.");
      stopLoop();
    }

    // Release processing lock
    setTimeout(() => {
      isProcessing = false;
    }, ACTION_DELAY_MS / 2);
  }

  // --- Control Functions ---
  function startLoop() {
    if (intervalId) {
      log("Loop already running.");
      return;
    }
    log("Starting loop...");
    isProcessing = false;
    setTimeout(() => {
      if (!intervalId) {
        processQueueItem();
        intervalId = setInterval(processQueueItem, CHECK_INTERVAL_MS);
      }
    }, 500);
    updateUI(true);
  }

  function stopLoop() {
    if (!intervalId) {
      return;
    }
    log("Stopping loop...");
    clearInterval(intervalId);
    intervalId = null;
    isProcessing = false;
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

  // --- Queue Generation ---
  function generateNewQueue() {
    // Method 1: Try using Steam's DiscoveryQueue directly
    try {
      if (typeof DiscoveryQueue !== "undefined") {
        log(" -> Found DiscoveryQueue object, calling GenerateNewQueue()");
        DiscoveryQueue.GenerateNewQueue();
        return true;
      }
    } catch (e) {
      log(` -> Error calling DiscoveryQueue.GenerateNewQueue(): ${e.message}`);
    }

    // Method 2: Try using jQuery if available
    try {
      if (typeof $J !== "undefined") {
        log(" -> Using jQuery to trigger queue refresh");
        $J("#refresh_queue_btn").click();
        return true;
      }
    } catch (e) {
      log(` -> Error using jQuery: ${e.message}`);
    }

    // Method 3: Regular click on refresh button
    const refreshBtn = document.getElementById("refresh_queue_btn");
    if (refreshBtn) {
      log(" -> Clicking refresh button");
      refreshBtn.click();

      // Try to make queue visible if needed
      const queueContainer = document.getElementById("discovery_queue_ctn");
      const queueEmptyContainer = document.querySelector(
        ".discover_queue_empty"
      );

      if (queueContainer && queueEmptyContainer) {
        queueEmptyContainer.style.display = "none";
        queueContainer.style.display = "";
      }

      // Try to find and click start link after refresh
      setTimeout(() => {
        const startLink = document.querySelector("#discovery_queue_start_link");
        if (startLink) startLink.click();
      }, 1000);

      return true;
    }

    // Method 4: Navigate to explore page
    log(" -> All methods failed. Navigating to explore page...");
    window.location.href = "https://store.steampowered.com/explore/";
    stopLoop();
    return false;
  }

  // --- UI ---
  function addControls() {
    const controlDiv = document.createElement("div");
    controlDiv.innerHTML = `
        <div id="wishlist-looper-controls" style="position: fixed; bottom: 10px; right: 10px; z-index: 9999; background: rgba(27, 40, 56, 0.9); color: #c7d5e0; padding: 10px; border-radius: 5px; font-family: 'Motiva Sans', sans-serif; font-size: 12px; border: 1px solid #000; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
          <strong style="color: #66c0f4;">Wishlist Looper</strong>
          <button id="wl-start" style="margin-left: 10px; padding: 4px 8px; background-color: #68932f; color: white; border: 1px solid #3a511b; border-radius: 2px; cursor: pointer;">Start</button>
          <button id="wl-stop" style="margin-left: 5px; padding: 4px 8px; background-color: #a33e29; color: white; border: 1px solid #5c2416; border-radius: 2px; cursor: pointer;" disabled>Stop</button>
          <div style="margin-top: 5px;">
            <label style="display: inline-flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="wl-autostart" style="margin-right: 4px; vertical-align: middle;"> Auto-Start
            </label>
            <label style="margin-left: 10px; display: inline-flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="wl-autorestart" style="margin-right: 4px; vertical-align: middle;"> Auto-Restart Queue
            </label>
          </div>
          <div id="wl-status" style="margin-top: 5px; font-size: 11px;">Status: Stopped</div>
        </div>
      `;
    document.body.appendChild(controlDiv);

    GM_addStyle(`
        #wishlist-looper-controls button:disabled {
          background-color: #555;
          color: #999;
          cursor: not-allowed;
          border-color: #333;
        }
        #wishlist-looper-controls button:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        #wl-status.running {
          color: #a1dd4a;
        }
        #wl-status.stopped {
          color: #ff7a7a;
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

    updateUI(false);
  }

  function updateUI(running) {
    const startBtn = document.getElementById("wl-start");
    const stopBtn = document.getElementById("wl-stop");
    const statusDiv = document.getElementById("wl-status");
    const autoStartCheckbox = document.getElementById("wl-autostart");
    const autoRestartCheckbox = document.getElementById("wl-autorestart");

    if (
      startBtn &&
      stopBtn &&
      statusDiv &&
      autoStartCheckbox &&
      autoRestartCheckbox
    ) {
      startBtn.disabled = running;
      stopBtn.disabled = !running;
      statusDiv.textContent = `Status: ${running ? "Running..." : "Stopped"}`;
      statusDiv.className = running ? "running" : "stopped";
      autoStartCheckbox.checked = autoStartEnabled;
      autoRestartCheckbox.checked = autoRestartQueueEnabled;
    }
  }

  // --- Initialization ---
  if (window.top === window.self) {
    log("Script loaded. Adding controls.");

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      addControls();

      // Check for empty queue on page load
      if (document.querySelector(".discover_queue_empty")) {
        log("Found empty queue on page load.");
        if (autoStartEnabled && autoRestartQueueEnabled) {
          log("Auto-start and auto-restart enabled. Generating new queue...");
          setTimeout(generateNewQueue, 1000);
        }
      }

      // Check if we're on the explore page
      if (window.location.href.includes("/explore")) {
        if (autoStartEnabled && autoRestartQueueEnabled) {
          setTimeout(() => {
            const queueStartLink = document.querySelector(
              SELECTORS.queueStartLink
            );
            if (queueStartLink) {
              log("Found queue start link on explore page. Clicking...");
              queueStartLink.click();
            } else {
              generateNewQueue();
            }
          }, 1000);
        }
      }

      if (autoStartEnabled) {
        log("Auto-start is enabled. Starting loop.");
        startLoop();
      } else {
        updateUI(false);
      }
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        addControls();
        if (autoStartEnabled) {
          log("Auto-start is enabled. Starting loop after DOMContentLoaded.");
          startLoop();
        } else {
          updateUI(false);
        }
      });
    }

    // Add Tampermonkey menu commands
    GM_registerMenuCommand("Start Wishlist Looper", startLoop);
    GM_registerMenuCommand("Stop Wishlist Looper", stopLoop);
    GM_registerMenuCommand(
      "Toggle Wishlist Looper Auto-Start",
      toggleAutoStart
    );
    GM_registerMenuCommand("Toggle Auto-Restart Queue", toggleAutoRestartQueue);
  } else {
    log("Running in iframe, controls/autostart skipped.");
  }
})();
