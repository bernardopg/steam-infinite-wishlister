// ==== Update Checker ====

import CONFIG from "./config.js";
import { State } from "./state.js";
import UI from "./ui.js";
import { compareVersions, log } from "./utils.js";

const readStoredTimestamp = () => {
  const raw = GM_getValue(CONFIG.STORAGE.UPDATE_LAST_CHECK, "0");
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const persistUpdateInfo = (version, url) => {
  GM_setValue(CONFIG.STORAGE.UPDATE_LATEST_VERSION, version || "");
  GM_setValue(CONFIG.STORAGE.UPDATE_URL, url || CONFIG.URLS.RELEASES);
};

const applyLatestInfo = (version, url) => {
  State.update.latestVersion = version;
  State.update.url = url || CONFIG.URLS.RELEASES;
};

const UpdateChecker = {
  restoreCached: () => {
    const latestVersion = GM_getValue(CONFIG.STORAGE.UPDATE_LATEST_VERSION, "");
    const updateUrl = GM_getValue(CONFIG.STORAGE.UPDATE_URL, CONFIG.URLS.RELEASES);

    if (latestVersion && compareVersions(CONFIG.VERSION, latestVersion) < 0) {
      applyLatestInfo(latestVersion, updateUrl);
      State.update.available = true;
      UI.showUpdateAvailable(latestVersion, updateUrl);
      log(`Update pendente em cache: v${latestVersion}`, 1);
      return;
    }

    State.update.available = false;
    UI.showCurrentVersion();
  },

  maybeCheck: () => {
    const lastCheck = readStoredTimestamp();
    const now = Date.now();
    if (now - lastCheck < CONFIG.TIMING.UPDATE_CHECK_COOLDOWN_MS) {
      log("Verificação de update em cooldown", 2);
      return Promise.resolve(false);
    }

    return UpdateChecker.check();
  },

  check: () =>
    new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        log("GM_xmlhttpRequest indisponível; update checker ignorado", 1);
        resolve(false);
        return;
      }

      const url = `${CONFIG.URLS.VERSION_JSON}?_=${Date.now()}`;
      log(`Verificando atualização em ${url}`, 1);

      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: CONFIG.TIMING.UPDATE_REQUEST_TIMEOUT_MS,
        onload: (response) => {
          GM_setValue(CONFIG.STORAGE.UPDATE_LAST_CHECK, String(Date.now()));

          if (response.status < 200 || response.status >= 300) {
            log(`Falha ao checar atualização: HTTP ${response.status}`, 1);
            resolve(false);
            return;
          }

          try {
            const data = JSON.parse(response.responseText || "{}");
            const latestVersion = String(data.version || "").trim();
            const updateUrl = String(data.updateUrl || CONFIG.URLS.RELEASES).trim();

            if (!latestVersion) {
              log("version.json sem campo version", 1);
              resolve(false);
              return;
            }

            applyLatestInfo(latestVersion, updateUrl);

            if (compareVersions(CONFIG.VERSION, latestVersion) < 0) {
              State.update.available = true;
              persistUpdateInfo(latestVersion, updateUrl);
              UI.showUpdateAvailable(latestVersion, updateUrl);
              log(`Update disponível: v${latestVersion}`);
            } else {
              State.update.available = false;
              persistUpdateInfo("", updateUrl);
              UI.showCurrentVersion();
              log("Nenhum update disponível", 1);
            }

            resolve(true);
          } catch (error) {
            log(`Erro ao parsear version.json: ${error.message}`, 1);
            resolve(false);
          }
        },
        ontimeout: () => {
          log("Timeout ao verificar atualização", 1);
          resolve(false);
        },
        onerror: () => {
          log("Erro de rede ao verificar atualização", 1);
          resolve(false);
        },
      });
    }),
};

export default UpdateChecker;
