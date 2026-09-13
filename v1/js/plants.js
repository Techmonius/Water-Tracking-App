// Approved raster artwork is rendered directly through explicit SVG clipping masks.
(function () {
  const flowerLayer = (asset, cx, cy, box = null, scale = 1.018) =>
    Object.freeze({ asset, cx, cy, box, scale });
  const flowerAnimation = (layers) =>
    Object.freeze({ layers: Object.freeze(layers) });
  const STARTER_STAGES = [
    {
      name: "Seed",
      minGoalDays: 0,
      asset: "v1/assets/plants/stage-1.webp",
      flowerAnimation: null,
    },
    {
      name: "Sprout",
      minGoalDays: 3,
      asset: "v1/assets/plants/stage-2.webp",
      flowerAnimation: null,
    },
    {
      name: "Two Leaves",
      minGoalDays: 6,
      asset: "v1/assets/plants/stage-3.webp",
      flowerAnimation: null,
    },
    {
      name: "Leafy Plant",
      minGoalDays: 10,
      asset: "v1/assets/plants/stage-4.webp",
      flowerAnimation: null,
    },
    {
      name: "Bud",
      minGoalDays: 15,
      asset: "v1/assets/plants/stage-5.webp",
      flowerAnimation: null,
    },
    {
      name: "First Flower",
      minGoalDays: 21,
      asset: "v1/assets/plants/stage-6.webp",
      flowerAnimation: null,
    },
    {
      name: "More Flowers",
      minGoalDays: 30,
      asset: "v1/assets/plants/stage-7.webp",
      flowerAnimation: null,
    },
    {
      name: "Full Bloom",
      minGoalDays: 45,
      asset: "v1/assets/plants/stage-8.webp",
      flowerAnimation: flowerAnimation([
        flowerLayer(
          "v1/assets/plants/overlays/stage-8-flower-1.webp",
          49.86,
          46.95,
          { x: 35.15625, y: 1.5625, w: 26.5625, h: 25 },
          1.08,
        ),
        flowerLayer(
          "v1/assets/plants/overlays/stage-8-flower-2.webp",
          46.92,
          46.8,
          { x: 23.4375, y: 12.5, w: 26.5625, h: 25 },
          1.08,
        ),
        flowerLayer(
          "v1/assets/plants/overlays/stage-8-flower-3.webp",
          47.08,
          45.03,
          { x: 46.09375, y: 21.09375, w: 26.5625, h: 24.21875 },
          1.08,
        ),
        null, // Added from the intact base artwork below.
        flowerLayer(
          "v1/assets/plants/overlays/stage-8-flower-5.webp",
          48.25,
          51.88,
          { x: 5.46875, y: 35.15625, w: 22.65625, h: 21.09375 },
          1.08,
        ),
      ]),
    },
  ];
  const sourceStages = (id, names, days) =>
    names.map((name, index) => ({
      name,
      minGoalDays: days[index],
      ...window.WT_V1_ARTWORK[id][index],
      flowerAnimation: window.WT_V1_ARTWORK[id][index].flowerAnimation || null,
    }));
  const SUNFLOWER_STAGES = sourceStages(
    "sunflower",
    [
      "Seed",
      "Sprout",
      "Young Plant",
      "Taller Plant",
      "Bud Forms",
      "Flower Opening",
      "Full Sunflower",
      "Sun Facing",
    ],
    [0, 4, 8, 14, 20, 26, 32, 36],
  );
  const MONSTERA_STAGES = sourceStages(
    "monstera",
    [
      "Seed",
      "Sprout",
      "Young Plant",
      "Growing Stronger",
      "Large Leaves",
      "Mature Plant",
      "Almost Full",
      "Full Monstera",
    ],
    [0, 4, 8, 13, 19, 26, 33, 40],
  );
  const starterCrop = (index, mask) => ({
    asset: STARTER_STAGES[index].asset,
    artwork: {
      viewBox: [0, 0, 128, 128],
      sourceWidth: 128,
      sourceHeight: 128,
      mask,
    },
  });
  // Exclude the detached two-pixel scan line outside the stage-7 plant.
  STARTER_STAGES[6].artwork = starterCrop(6, "M0 0h120v128H0z").artwork;
  function croppedFlower(index, mask, cx, cy, scale = 1.06) {
    return {
      ...starterCrop(index, mask),
      cx: (cx / 128) * 100,
      cy: (cy / 128) * 100,
      scale,
    };
  }
  STARTER_STAGES[5].flowerAnimation = {
    layers: [croppedFlower(5, "M44 2h34v39H44z", 61, 21)],
  };
  STARTER_STAGES[6].flowerAnimation = {
    layers: [
      croppedFlower(6, "M7 45h27v26H7z", 21, 57),
      croppedFlower(6, "M31 18h30v29H31z", 46, 33),
      croppedFlower(6, "M60 28h31v31H60z", 75, 42),
    ],
  };
  STARTER_STAGES[7].flowerAnimation = {
    layers: STARTER_STAGES[7].flowerAnimation.layers.map((layer, index) =>
      index === 3
        ? croppedFlower(
            7,
            "M87 39h9v5h6v7h3v8h-7v6H87v-5h-4v-9h3v-6h1z",
            91,
            52,
          )
        : layer,
    ),
  };
  let artSerial = 0;
  const attr = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function artMarkup(asset, artwork, className = "", label = "") {
    if (!artwork)
      return (
        '<img class="' +
        attr(className) +
        '" src="' +
        attr(asset) +
        '" alt="' +
        attr(label) +
        '">'
      );
    const id = "plant-clip-" + ++artSerial;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" class="' +
      attr(className) +
      '" viewBox="' +
      artwork.viewBox.join(" ") +
      '" role="img" aria-label="' +
      attr(label) +
      '"><defs><clipPath id="' +
      id +
      '" clipPathUnits="userSpaceOnUse"><path shape-rendering="crispEdges" d="' +
      artwork.mask +
      '"/></clipPath></defs><image href="' +
      attr(asset) +
      '" width="' +
      artwork.sourceWidth +
      '" height="' +
      artwork.sourceHeight +
      '" clip-path="url(#' +
      id +
      ')"/></svg>'
    );
  }
  function artElement(stage, className = "", label = "") {
    const holder = document.createElement("div");
    holder.innerHTML = artMarkup(stage.asset, stage.artwork, className, label);
    return holder.firstElementChild;
  }
  const CATALOG = Object.freeze({
    starter_flower: Object.freeze({
      id: "starter_flower",
      name: "Starter Flower",
      durationGoalDays: 45,
      enabled: true,
      stages: Object.freeze(STARTER_STAGES.map(Object.freeze)),
    }),
    sunflower: Object.freeze({
      id: "sunflower",
      name: "Sunflower",
      durationGoalDays: 36,
      enabled: true,
      stages: Object.freeze(SUNFLOWER_STAGES.map(Object.freeze)),
    }),
    monstera: Object.freeze({
      id: "monstera",
      name: "Monstera",
      durationGoalDays: 40,
      enabled: true,
      stages: Object.freeze(MONSTERA_STAGES.map(Object.freeze)),
    }),
  });
  const DEFAULT_ID = "starter_flower";
  function definition(id) {
    return CATALOG[id] || CATALOG[DEFAULT_ID];
  }
  function stageFor(id, goalDays) {
    const plant = definition(id),
      days = Math.max(0, Number(goalDays) || 0);
    let index = 0;
    for (let i = 0; i < plant.stages.length; i++)
      if (days >= plant.stages[i].minGoalDays) index = i;
    return { index, stage: plant.stages[index], plant };
  }
  function progress(state, lifetimeGoalDays) {
    const p = state?.plantProgress || {},
      plant = definition(p.currentPlantId),
      baseline = Math.max(0, Number(p.startedAtGoalDays) || 0),
      days = Math.max(0, (Number(lifetimeGoalDays) || 0) - baseline),
      current = stageFor(plant.id, days);
    return {
      plant,
      plantId: plant.id,
      baseline,
      goalDays: days,
      stageIndex: current.index,
      stage: current.stage,
      complete: days >= plant.durationGoalDays,
      completionPending: p.completionPending || null,
      completedPlants: Array.isArray(p.completedPlants)
        ? p.completedPlants
        : [],
    };
  }
  function completedIds(progressState) {
    return (progressState?.completedPlants || [])
      .map((x) => (typeof x === "string" ? x : x?.plantId))
      .filter(Boolean);
  }
  function mysteryPool(doneIds = []) {
    const done = new Set(doneIds);
    return Object.values(CATALOG).filter(
      (p) => p.id !== DEFAULT_ID && p.enabled !== false && !done.has(p.id),
    );
  }
  function awardPendingSeed(
    pp,
    random = Math.random,
    now = () => new Date().toISOString(),
  ) {
    if (pp.nextSeed) return false;
    const pool = mysteryPool(completedIds(pp));
    if (!pool.length) return false;
    const raw = Math.floor((Number(random()) || 0) * pool.length),
      index = Math.max(0, Math.min(pool.length - 1, raw)),
      next = pool[index];
    pp.nextSeed = { plantId: next.id, awardedAt: now() };
    return true;
  }
  function reconcileCompletion(
    state,
    lifetimeGoalDays,
    random = Math.random,
    now = () => new Date().toISOString(),
  ) {
    const pp =
      state.plantProgress ||
      (state.plantProgress = {
        currentPlantId: DEFAULT_ID,
        startedAtGoalDays: 0,
        startedAtDate: null,
        completionPending: null,
        completedPlants: [],
        nextSeed: null,
      });
    if (!Array.isArray(pp.completedPlants)) pp.completedPlants = [];
    const life = progress(state, lifetimeGoalDays);
    let changed = false;
    if (pp.completionPending) {
      changed = awardPendingSeed(pp, random, now) || changed;
      return { changed, life };
    }
    if (!life.complete) return { changed: false, life };
    if (!completedIds(pp).includes(life.plantId)) {
      pp.completedPlants.push({
        plantId: life.plantId,
        name: life.plant.name,
        completedAt: now(),
        goalDays: life.goalDays,
      });
      changed = true;
    }
    pp.completionPending = {
      plantId: life.plantId,
      plantName: life.plant.name,
      completedAt: now(),
      goalDays: life.goalDays,
    };
    changed = true;
    changed = awardPendingSeed(pp, random, now) || changed;
    return { changed, life };
  }
  function plantMysterySeed(state, lifetimeGoalDays, startedAtDate) {
    const pp = state.plantProgress || {},
      seed = pp.nextSeed;
    if (!pp.completionPending || !seed?.plantId) return null;
    const next = definition(seed.plantId);
    if (!next || next.enabled === false || next.id === DEFAULT_ID) return null;
    pp.currentPlantId = next.id;
    pp.startedAtGoalDays = Math.max(0, Number(lifetimeGoalDays) || 0);
    pp.startedAtDate = startedAtDate || null;
    pp.completionPending = null;
    pp.nextSeed = null;
    state.plantProgress = pp;
    return next;
  }
  window.WT_V1_PLANTS = {
    artMarkup,
    artElement,
    CATALOG,
    DEFAULT_ID,
    definition,
    stageFor,
    progress,
    completedIds,
    mysteryPool,
    reconcileCompletion,
    plantMysterySeed,
  };
})();
