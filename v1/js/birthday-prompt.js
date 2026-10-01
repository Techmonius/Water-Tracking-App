(function () {
  const S = window.WT_V1_STORAGE, D = window.WT_V1_DATE;
  const gate = document.getElementById("birthdayGate");
  const input = document.getElementById("requiredBirthday");
  const error = document.getElementById("birthdayGateError");
  function required() {
    const value = S.load().settings.birthday;
    return !S.validBirthday(value) || value > D.dayKey();
  }
  function check() {
    input.max = D.dayKey();
    document.getElementById("birthday").max = D.dayKey();
    if (required()) {
      if (!gate.open) { gate.showModal(); input.focus(); }
    } else if (gate.open) gate.close();
  }
  gate.addEventListener("cancel", (event) => { if (required()) event.preventDefault(); });
  gate.addEventListener("close", check);
  document.getElementById("birthdayGateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    if (!input.reportValidity()) return;
    try {
      const api = window.WT_V1_HYDRATION.createApi(S.load(), () => {});
      api.saveSettings({ birthday: input.value });
      window.dispatchEvent(new CustomEvent("wt-profile-saved"));
      window.WT_V1_TELEMETRY.track("birthday_saved", { feature: "Birthday setup", summary: "Saved required birthday", outcome: "saved" });
      check();
    } catch (e) { error.textContent = e.message || "Birthday could not be saved. Please try again."; }
  });
  ["storage", "wt-data-changed", "pageshow"].forEach(name => window.addEventListener(name, check));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  check();
})();
