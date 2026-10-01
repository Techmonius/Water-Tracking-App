(function () {
  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycbykCIKxRnB_gQC0IOHrl3X5wSfAdC6chsxeJQSlO1wsd762PlF_oWEvt5JDjH1xGIZb-A/exec";
  const C = window.WT_V1_CONFIG;
  function uid() {
    return crypto?.randomUUID?.() || String(Date.now() + Math.random());
  }
  function installId() {
    let id = localStorage.getItem(C.telemetryInstallKey);
    if (!id) {
      id = uid();
      localStorage.setItem(C.telemetryInstallKey, id);
    }
    return id;
  }
  function device() {
    const u = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(u)
      ? "iOS"
      : /Android/i.test(u)
        ? "Android"
        : /Windows/i.test(u) ? "Windows"
        : /Macintosh/i.test(u) ? (navigator.maxTouchPoints > 1 ? "iPadOS" : "macOS")
        : /Linux/i.test(u) ? "Linux" : "Other";
  }
  function sessionId() {
    return sessionStorage.wtV1Session || (sessionStorage.wtV1Session = uid());
  }
  function reportContext() {
    const base = {
      screen: document.querySelector(".view.active")?.id || "unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      locale: navigator.language || "",
    };
    try {
      const S = window.WT_V1_STORAGE,
        H = window.WT_V1_HYDRATION,
        ST = window.WT_V1_STATS,
        E = window.WT_V1_ENGAGEMENT;
      if (!S || !H || !ST) return base;
      const state = S.load(),
        api = H.createApi(state, () => {}),
        stats = ST.calculate(api),
        plant = E?.plant?.(api),
        dailyWins = Object.values(state.engagement?.daily?.counts || {}).reduce(
          (a, b) => a + (Number(b) || 0),
          0,
        );
      return {
        ...base,
        birthday: state.settings?.birthday || null,
        todayOz: api.totalFor(),
        todayGoal: api.goalFor(),
        goalMode: state.settings?.goalMode || "daily",
        lifetimeOz: Math.round(stats.lifetimeOz),
        goalDays: stats.goalDays,
        currentStreak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        trackedDays: stats.daysTracked,
        plantId: plant?.plantId || state.plantProgress?.currentPlantId || "",
        plantStage: plant?.name || "",
        plantGoalDays: plant?.goalDays || 0,
        completedPlants: (state.plantProgress?.completedPlants || []).length,
        permanentBadges: Object.keys(state.engagement?.permanent || {}).length,
        dailyWinCount: dailyWins,
      };
    } catch {
      return base;
    }
  }
  function describe(event, data) {
    const sourceNames = {quick_add: "Quick-add button", saved_cup: "Saved cup", custom: "Custom amount", previous_day: "Previous-day entry"};
    let feature = data.feature || "Unspecified";
    let summary = data.summary || event.replaceAll("_", " ");
    if (event === "drink_logged") {
      feature = sourceNames[data.source] || "Water logging";
      summary = "Logged " + data.amountOz + " oz using " + feature.toLowerCase() + " for " + (data.date || "today");
    } else if (event === "app_opened") {
      const standalone = matchMedia("(display-mode: standalone)").matches;
      feature = standalone ? "App launch — home screen" : "App launch — browser";
      summary = standalone ? "Opened the installed app" : "Opened the app in a browser";
    } else if (event === "goal_celebration") {
      feature = "Daily goal celebration";
      summary = "Reached today's water goal";
    } else if (event === "developer_info_opened") {
      feature = "Developer information"; summary = "Opened developer information";
    }
    return {feature, summary};
  }
  function track(event, data = {}) {
    // Reporting must never interrupt a successfully saved water entry.
    try {
      const now = new Date(), context = reportContext(), description = describe(event, data);
      const safeData = {};
      ["amountOz", "date", "source", "action", "outcome", "plantId"].forEach(key => {
        if (typeof data[key] === "string" || typeof data[key] === "number") safeData[key] = data[key];
      });
      const payload = {
        event, eventId: uid(), label: description.summary, summary: description.summary,
        feature: description.feature,
        data: {...safeData, feature: description.feature, featureDetail: description.feature, summary: description.summary},
        installId: installId(), sessionId: sessionId(), version: C.appVersion,
        device: device(), standalone: Boolean(matchMedia("(display-mode: standalone)").matches),
        localDate: window.WT_V1_DATE.dayKey(), localTime: now.toLocaleTimeString(),
        timestamp: now.toISOString(), ...context,
      };
      fetch(ENDPOINT, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), keepalive: true,
      }).catch(() => {});
    } catch {}
  }
  let wasHidden = document.hidden;
  document.addEventListener("visibilitychange", () => {
    if (wasHidden && !document.hidden) track("app_resumed", {feature: "App resume", summary: "Returned to the app"});
    wasHidden = document.hidden;
  });
  window.WT_V1_TELEMETRY = { track, installId, reportContext };
})();
