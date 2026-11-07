/**
 * ============================================================================
 * CELLULUM — Argon Engine v2.4 (Universal Schema v1.0 & v1.1)
 * Fully synchronized with index.html DOM IDs & module1.json - module14.json
 * ============================================================================
 */

const APP_CONFIG = {
  name: "Cellulum",
  searchPaths: ["./data/", "./", "./modules/"]
};

const MODULE_REGISTRY = [
  {
    id: "module_01",
    shortUnit: "MOD 01",
    title: "Mitochondrial Bioenergetics & OxPhos",
    files: ["module1.json", "module_01_bioenergetics.json", "module_01.json"]
  },
  {
    id: "module_02",
    shortUnit: "MOD 02",
    title: "The Nucleus, Chromatin & Transcription",
    files: ["module2.json", "module_02_nucleus.json", "module_02.json"]
  },
  {
    id: "module_02b",
    shortUnit: "MOD 02B",
    title: "Core Module 2B (DNA / Metabolic / Specialized)",
    files: ["module2b.json", "module2B.json", "module_02b.json", "module_2b.json"]
  },
  {
    id: "module_03",
    shortUnit: "MOD 03",
    title: "Protein Synthesis, Translocation & ER",
    files: ["module3.json", "module_03_ribosome_er.json", "module_03.json"]
  },
  {
    id: "module_04",
    shortUnit: "MOD 04",
    title: "Cell Signaling & Membrane Receptors",
    files: ["module4.json", "module_04_signaling.json", "module_04.json"]
  },
  {
    id: "module_05",
    shortUnit: "MOD 05",
    title: "Cytoskeleton, Motors & Cell Adhesion",
    files: ["module5.json", "module_05_cytoskeleton_ecm.json", "module_05.json"]
  },
  {
    id: "module_06",
    shortUnit: "MOD 06",
    title: "Cell Cycle, Mitosis & Apoptosis",
    files: ["module6.json", "module_06.json"]
  },
  {
    id: "module_07",
    shortUnit: "MOD 07",
    title: "DNA Replication, Repair & Recombination",
    files: ["module7.json", "module_07.json"]
  },
  {
    id: "module_08",
    shortUnit: "MOD 08",
    title: "Developmental Biology & Morphogenesis",
    files: ["module8.json", "module_08_developmental_bio_revised.json", "module_08.json"]
  },
  {
    id: "module_09",
    shortUnit: "MOD 09",
    title: "Plant Physiology & Photosynthesis",
    files: ["module9.json", "module_09.json"]
  },
  {
    id: "module_10",
    shortUnit: "MOD 10",
    title: "Animal Physiology & Neurobiology",
    files: ["module10.json", "module_10.json"]
  },
  {
    id: "module_11",
    shortUnit: "MOD 11",
    title: "Immunology & Host Defense",
    files: ["module11.json", "module_11.json"]
  },
  {
    id: "module_12",
    shortUnit: "MOD 12",
    title: "Inheritance Biology, Operons & Mapping",
    files: ["module12.json", "module_12_genetics_mapping.json"]
  },
  {
    id: "module_13",
    shortUnit: "MOD 13",
    title: "Ecological Principles & Biogeography",
    files: ["module13.json", "module_13_ecology.json", "module_13_ecology_revised.json"]
  },
  {
    id: "module_14",
    shortUnit: "MOD 14",
    title: "Biophysical Methods & Techniques",
    files: ["module14.json", "module_14_methods.json", "module_14_wetlab_biophysics.json"]
  }
];

const state = {
  activeRegistryItem: MODULE_REGISTRY[0],
  moduleData: null,
  activeScaleId: "L1",
  activeNodeId: null,
  activeDrawerTab: "mechanism",
  activeSimAgentId: null,
  quizMode: false,
  currentQuizIdx: 0,
  cache: {}
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  injectMathJaxSupport();
  renderSidebarNav(MODULE_REGISTRY);
  bindArgonEvents();
  loadModule(MODULE_REGISTRY[0].id);
});

function injectMathJaxSupport() {
  if (!window.MathJax) {
    window.MathJax = {
      tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]], displayMath: [["$$", "$$"]] },
      svg: { fontCache: "global" }
    };
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    document.head.appendChild(script);
  }
}

// ============================================================================
// MODULE JSON FETCHER (WITH FALLBACK & DOCX BINARY PROTECTION)
// ============================================================================
async function loadModule(registryId) {
  const regItem = MODULE_REGISTRY.find(m => m.id === registryId) || MODULE_REGISTRY[0];
  state.activeRegistryItem = regItem;
  state.activeSimAgentId = null;
  state.currentQuizIdx = 0;

  // Highlight active module in sidebar
  document.querySelectorAll(".mod-nav-card").forEach(el => {
    const isActive = el.dataset.id === regItem.id;
    el.classList.toggle("border-emerald-500", isActive);
    el.classList.toggle("bg-emerald-950/30", isActive);
  });

  const titleEl = document.getElementById("activeModuleTitle");
  if (titleEl) titleEl.textContent = "Loading Module...";

  if (state.cache[regItem.id]) {
    state.moduleData = state.cache[regItem.id];
  } else {
    state.moduleData = await fetchJsonFromPaths(regItem);
    state.cache[regItem.id] = state.moduleData;
  }

  // Auto-update sidebar title from loaded JSON title if present
  if (state.moduleData && state.moduleData.title) {
    regItem.title = state.moduleData.title;
    const activeCardTitle = document.querySelector(`.mod-nav-card[data-id="${regItem.id}"] .text-slate-200`);
    if (activeCardTitle) activeCardTitle.textContent = state.moduleData.title;
  }

  // Apply module theme color if defined
  const root = document.documentElement;
  root.style.setProperty("--theme-color", state.moduleData.theme_color || "#10b981");
  root.style.setProperty("--accent-glow", state.moduleData.accent_glow || "rgba(16, 185, 129, 0.45)");

  // Default to L1 (or first available scale level) and its first node
  const levels = state.moduleData.scale_levels || [];
  const firstLevel = levels[0] || { level_id: "L1", hotspots: [] };
  state.activeScaleId = firstLevel.level_id || "L1";
  const levelNodes = firstLevel.node_ids || firstLevel.hotspots || [];
  state.activeNodeId = levelNodes[0] || Object.keys(state.moduleData.nodes || {})[0];

  renderArgonWorkspace();
}

async function fetchJsonFromPaths(regItem) {
  for (const dir of APP_CONFIG.searchPaths) {
    for (const file of regItem.files) {
      try {
        const res = await fetch(`${dir}${file}`);
        if (res.ok) {
          const raw = await res.text();
          if (raw.trim().startsWith("{")) {
            return JSON.parse(raw);
          }
        }
      } catch (err) {
        // Continue checking next path
      }
    }
  }
  return getFallbackModuleData(regItem);
}

// ============================================================================
// ARGON WORKSPACE RENDERER (MATCHED TO YOUR INDEX.HTML IDs)
// ============================================================================
function renderArgonWorkspace() {
  const mod = state.moduleData;
  const reg = state.activeRegistryItem;

  // 1. Top Unit & Title Bar
  const unitTagEl = document.getElementById("activeUnitTag");
  const titleEl = document.getElementById("activeModuleTitle");
  if (unitTagEl) {
    const unitInfo = Array.isArray(mod.csir_net_units) && mod.csir_net_units.length
      ? `${reg.shortUnit} • ${mod.csir_net_units[0]}`
      : reg.shortUnit;
    unitTagEl.textContent = unitInfo;
  }
  if (titleEl) {
    titleEl.textContent = mod.title || reg.title;
  }

  // 2. Update L1 - L4 Scale Switcher Buttons
  const levels = mod.scale_levels || [];
  document.querySelectorAll(".scale-btn").forEach(btn => {
    const scaleId = btn.dataset.scale;
    const isCurrent = scaleId === state.activeScaleId;
    btn.classList.toggle("active", isCurrent);

    const lvlObj = levels.find(l => l.level_id === scaleId);
    if (lvlObj) {
      const shortLabel = lvlObj.scale_metric ? `${scaleId} · ${lvlObj.scale_metric.split(" ")[0]}` : `${scaleId}`;
      btn.textContent = shortLabel;
      btn.title = `${lvlObj.name} (${lvlObj.scale_metric || ""})`;
    }
  });

  renderHotspotStage();
  renderNodeInspectorAndDrawer();
  renderPathwaySimulator();
  typesetMath();
}

// ============================================================================
// CENTER STAGE: HOTSPOT NODES, 2D PINS & QUIZ BAR (#hotspotCanvas)
// ============================================================================
function renderHotspotStage() {
  const mod = state.moduleData;
  const levels = mod.scale_levels || [];
  const activeLvl = levels.find(l => l.level_id === state.activeScaleId) || levels[0];
  if (!activeLvl) return;

  // Update HUD Scale Label & Bottom Summary
  const hudLabel = document.getElementById("hudScaleLabel");
  if (hudLabel) {
    hudLabel.textContent = `${activeLvl.level_id}: ${activeLvl.name} ${activeLvl.scale_metric ? `[${activeLvl.scale_metric}]` : ""}`;
  }

  const summaryText = document.getElementById("scaleSummaryText");
  if (summaryText) {
    summaryText.textContent = activeLvl.description || "Select a hotspot node above to inspect biochemical mechanisms and Part C analytical traps.";
  }

  const canvas = document.getElementById("hotspotCanvas");
  if (!canvas) return;

  const nodeIds = activeLvl.node_ids || activeLvl.hotspots || [];
  const activeAgent = (mod.inhibitor_simulator?.agents || []).find(a => a.id === state.activeSimAgentId);
  const quizzes = mod.quiz_challenges || [];

  // Optional Quiz Bar inside the stage
  let quizHtml = "";
  if (quizzes.length > 0) {
    const q = quizzes[state.currentQuizIdx] || quizzes[0];
    quizHtml = `
      <div class="w-full mb-4 p-3.5 rounded-xl bg-slate-950/90 border ${state.quizMode ? 'border-amber-500/70' : 'border-slate-800'}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-700/60">
              <i class="fa-solid fa-bolt mr-1"></i>CSIR Quiz (${state.currentQuizIdx + 1}/${quizzes.length})
            </span>
            <span class="text-xs font-semibold text-slate-200">${state.quizMode ? "Click the matching hotspot node below!" : "Test your Part-C recall on this module"}</span>
          </div>
          <div class="flex items-center space-x-1.5">
            ${state.quizMode ? `
              <button id="prevQuizStageBtn" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"><i class="fa-solid fa-chevron-left"></i></button>
              <button id="nextQuizStageBtn" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"><i class="fa-solid fa-chevron-right"></i></button>
            ` : ""}
            <button id="toggleQuizStageBtn" class="px-2.5 py-1 rounded-lg text-xs font-semibold ${state.quizMode ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'}">
              ${state.quizMode ? "Exit Quiz" : "Start Quiz"}
            </button>
          </div>
        </div>
        ${state.quizMode ? `
          <div class="mt-2.5 text-xs text-amber-100 leading-relaxed font-medium">${formatRichText(q.prompt)}</div>
          ${Array.isArray(q.answer_options) && q.answer_options.length ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
              ${q.answer_options.map((opt, i) => `
                <button data-opt-idx="${i}" class="quiz-mcq-choice p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 transition">
                  ${formatRichText(opt)}
                </button>
              `).join("")}
            </div>
          ` : ""}
          <div id="stageQuizFeedback" class="hidden mt-2.5 p-2.5 rounded-lg text-xs"></div>
        ` : ""}
      </div>
    `;
  }

  // Render Interactive Hotspot Cards Grid
  const cardsHtml = nodeIds.map((nid, idx) => {
    const node = mod.nodes?.[nid];
    if (!node) return "";
    const isSelected = node.id === state.activeNodeId;
    const isPerturbed = activeAgent && activeAgent.target_node === node.id;
    const metricKeys = Object.keys(node.metrics || {});
    const previewMetric = metricKeys.length ? `${metricKeys[0].replace(/_/g, " ")}: ${node.metrics[metricKeys[0]]}` : "";

    return `
      <div data-node-id="${node.id}" class="hotspot-node-card cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? "bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.01]"
          : "bg-slate-950/80 border-slate-800/90 hover:border-slate-600 hover:bg-slate-900/80"
      } ${isPerturbed ? "ring-2 ring-rose-500 border-rose-500" : ""}">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
              ${node.level} • Hotspot ${idx + 1}
            </span>
            <div class="flex items-center space-x-1.5">
              ${isPerturbed ? `<span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">Inhibited</span>` : ""}
              ${node.next_zoom_target ? `
                <button data-zoom-to="${node.next_zoom_target}" class="zoom-jump-chip text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/90 hover:bg-sky-900 text-sky-300 border border-sky-700/60 transition">
                  Zoom ${node.next_zoom_target} <i class="fa-solid fa-arrow-up-right-from-square ml-0.5"></i>
                </button>
              ` : ""}
            </div>
          </div>
          <h4 class="text-sm font-bold text-white leading-snug">${formatRichText(node.title)}</h4>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${formatRichText(node.subtitle || "")}</p>
        </div>

        ${previewMetric ? `
          <div class="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono line-clamp-2">
            ${formatRichText(previewMetric)}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  const gridCols = nodeIds.length >= 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3";
  canvas.innerHTML = `
    <div class="w-full">
      ${quizHtml}
      <div class="grid ${gridCols} gap-3.5 w-full">
        ${cardsHtml}
      </div>
    </div>
  `;

  // Bind Hotspot Card Clicks
  canvas.querySelectorAll(".hotspot-node-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const zoomBtn = e.target.closest(".zoom-jump-chip");
      if (zoomBtn) {
        e.stopPropagation();
        const nextScale = zoomBtn.dataset.zoomTo;
        state.activeScaleId = nextScale;
        const targetLvl = (mod.scale_levels || []).find(l => l.level_id === nextScale);
        const nextNodes = targetLvl?.node_ids || targetLvl?.hotspots || [];
        if (nextNodes.length) state.activeNodeId = nextNodes[0];
        renderArgonWorkspace();
        return;
      }

      const clickedId = card.dataset.nodeId;
      state.activeNodeId = clickedId;
      renderHotspotStage();
      renderNodeInspectorAndDrawer();

      if (state.quizMode) {
        evaluateQuizNodeSelection(clickedId);
      }
      typesetMath();
    });
  });

  // Bind Quiz Controls if present
  document.getElementById("toggleQuizStageBtn")?.addEventListener("click", () => {
    state.quizMode = !state.quizMode;
    renderHotspotStage();
    typesetMath();
  });
  document.getElementById("prevQuizStageBtn")?.addEventListener("click", () => {
    state.currentQuizIdx = (state.currentQuizIdx - 1 + quizzes.length) % quizzes.length;
    renderHotspotStage();
    typesetMath();
  });
  document.getElementById("nextQuizStageBtn")?.addEventListener("click", () => {
    state.currentQuizIdx = (state.currentQuizIdx + 1) % quizzes.length;
    renderHotspotStage();
    typesetMath();
  });
  canvas.querySelectorAll(".quiz-mcq-choice").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = quizzes[state.currentQuizIdx];
      const chosen = q.answer_options[Number(btn.dataset.optIdx)];
      const ok = chosen === q.correct_answer;
      showStageQuizFeedback(ok, ok ? q.explanation : `Correct Answer: ${q.correct_answer}. ${q.explanation}`);
    });
  });
}

function evaluateQuizNodeSelection(clickedNodeId) {
  const quizzes = state.moduleData.quiz_challenges || [];
  const q = quizzes[state.currentQuizIdx];
  if (!q || !q.correct_node_id) return;

  const isCorrect = clickedNodeId === q.correct_node_id;
  const msg = isCorrect
    ? (q.feedback?.correct || q.explanation)
    : (q.feedback?.incorrect || `Not quite! Hint: Check the scale levels for ${q.correct_node_id.replace(/_/g, " ")}.`);
  showStageQuizFeedback(isCorrect, msg);
}

function showStageQuizFeedback(isCorrect, text) {
  const box = document.getElementById("stageQuizFeedback");
  if (!box) return;
  box.classList.remove("hidden");
  box.className = `mt-2.5 p-2.5 rounded-lg text-xs border ${
    isCorrect
      ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
      : "bg-rose-950/90 border-rose-500 text-rose-200"
  }`;
  box.innerHTML = `<strong>${isCorrect ? "✓ Spot On!" : "✗ Try Again:"}</strong> ${formatRichText(text)}`;
  typesetMath();
}

// ============================================================================
// RIGHT COLUMN INSPECTOR (#nodeInspectorContent) & SLIDE-OUT DRAWER (#drawerBody)
// ============================================================================
function renderNodeInspectorAndDrawer() {
  const mod = state.moduleData;
  const node = mod.nodes?.[state.activeNodeId];
  if (!node) return;

  const inspector = document.getElementById("nodeInspectorContent");
  if (inspector) {
    const metricsHtml = Object.entries(node.metrics || {}).map(([k, v]) => `
      <div class="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90">
        <div class="text-[10px] font-mono uppercase text-emerald-400 font-bold">${k.replace(/_/g, " ")}</div>
        <div class="text-xs text-slate-200 mt-0.5 leading-snug">${formatRichText(String(v))}</div>
      </div>
    `).join("");

    const mechPreview = (node.tabs?.mechanism || []).slice(0, 2).map(p => `
      <p class="text-xs text-slate-300 leading-relaxed">${formatRichText(p)}</p>
    `).join("");

    const resourcesHtml = (node.external_resources || []).map(r => `
      <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition">
        <span class="text-[11px] text-emerald-300 truncate pr-2">${r.title}</span>
        <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">${r.type || "3D / Ref"}</span>
      </a>
    `).join("");

    inspector.innerHTML = `
      <div class="pb-2 border-b border-slate-800">
        <div class="text-[10px] font-mono uppercase text-emerald-400">${node.level} Active Hotspot</div>
        <h4 class="text-sm font-bold text-white mt-0.5">${formatRichText(node.title)}</h4>
        <p class="text-[11px] text-slate-400 mt-0.5">${formatRichText(node.subtitle || "")}</p>
      </div>
      <div class="space-y-2 my-2.5">${metricsHtml}</div>
      <div class="space-y-2 pt-2 border-t border-slate-800/80">${mechPreview}</div>
      <button id="inspectorOpenDrawerBtn" class="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition flex items-center justify-center space-x-1.5">
        <i class="fa-solid fa-book-open"></i>
        <span>Read Full Part-C Notes, Pathology & Assays</span>
      </button>
      ${resourcesHtml ? `<div class="space-y-1.5 pt-2.5 border-t border-slate-800/80">${resourcesHtml}</div>` : ""}
    `;

    document.getElementById("inspectorOpenDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(true));
  }

  // Populate Slide-Out Study Drawer (#drawerTitle & #drawerBody)
  renderSlideOutDrawer(node);

  // Trigger Live NCBI PubMed Lookup for the selected node
  fetchPubMedArticles(node.title);
}

function renderSlideOutDrawer(node) {
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerBody = document.getElementById("drawerBody");
  if (drawerTitle) drawerTitle.textContent = node.title;
  if (!drawerBody) return;

  const tabsConfig = [
    { key: "mechanism", label: "Mechanism", icon: "fa-gears" },
    { key: "csir_high_yield", label: "CSIR High-Yield", icon: "fa-bullseye" },
    { key: "pathology", label: "Pathology", icon: "fa-heart-pulse" },
    { key: "lab_workbench", label: "Lab Workbench", icon: "fa-flask" }
  ];

  const tabBarHtml = `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4">
      ${tabsConfig.map(t => `
        <button data-drawer-tab="${t.key}" class="drawer-tab-pill py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 ${
          state.activeDrawerTab === t.key
            ? "bg-emerald-600 text-white shadow"
            : "text-slate-400 hover:text-slate-200"
        }">
          <i class="fa-solid ${t.icon} text-[10px]"></i>
          <span>${t.label}</span>
        </button>
      `).join("")}
    </div>
  `;

  const paragraphs = node.tabs?.[state.activeDrawerTab] || ["No notes recorded for this tab."];
  const contentHtml = paragraphs.map(p => `
    <div class="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs text-slate-200 leading-relaxed">
      ${formatRichText(p)}
    </div>
  `).join("");

  const metricsSummary = Object.entries(node.metrics || {}).map(([k, v]) => `
    <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
      <span class="text-[10px] font-mono uppercase text-emerald-400 font-bold block">${k.replace(/_/g, " ")}</span>
      <span class="text-xs text-slate-300">${formatRichText(String(v))}</span>
    </div>
  `).join("");

  drawerBody.innerHTML = `
    <div class="text-[11px] text-slate-400 mb-2">${formatRichText(node.subtitle || "")}</div>
    ${tabBarHtml}
    <div class="space-y-3">${contentHtml}</div>
    ${metricsSummary ? `
      <div class="mt-6 pt-4 border-t border-slate-800">
        <div class="text-[10px] font-mono uppercase text-slate-400 mb-2">Key Quantitative Metrics & Constants</div>
        <div class="space-y-2">${metricsSummary}</div>
      </div>
    ` : ""}
  `;

  drawerBody.querySelectorAll(".drawer-tab-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeDrawerTab = btn.dataset.drawerTab;
      renderSlideOutDrawer(node);
      typesetMath();
    });
  });
}

// ============================================================================
// PATHWAY & INHIBITOR SIMULATOR PANEL (#simulatorPanel)
// ============================================================================
function renderPathwaySimulator() {
  const simPanel = document.getElementById("simulatorPanel");
  if (!simPanel) return;

  const sim = state.moduleData?.inhibitor_simulator;
  const agents = sim?.agents || [];
  const activeAgent = agents.find(a => a.id === state.activeSimAgentId);

  const baseline = sim?.baseline_metrics || {};
  const predicted = activeAgent?.predicted_phenotype || activeAgent?.resulting_metrics || {};

  const metricsHtml = Object.keys(baseline).map(k => {
    const baseVal = baseline[k];
    const newVal = activeAgent && predicted[k] !== undefined ? predicted[k] : baseVal;
    const changed = activeAgent && String(newVal) !== String(baseVal);
    return `
      <div class="p-2.5 rounded-xl bg-slate-950 border ${changed ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800'}">
        <div class="text-[10px] font-mono uppercase ${changed ? 'text-rose-400 font-bold' : 'text-slate-400'}">${k.replace(/_/g, " ")}</div>
        <div class="text-xs font-semibold ${changed ? 'text-rose-200' : 'text-emerald-300'} mt-0.5">${formatRichText(String(newVal))}</div>
      </div>
    `;
  }).join("");

  const agentsButtonsHtml = agents.map(ag => {
    const isSelected = ag.id === state.activeSimAgentId;
    return `
      <button data-sim-agent="${ag.id}" class="sim-agent-pill px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
        isSelected
          ? "bg-rose-950/90 border-rose-500 text-rose-200 shadow"
          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500/50"
      }">
        <i class="fa-solid fa-vial-circle-check text-[10px] ${isSelected ? 'text-rose-400' : 'text-emerald-400'}"></i>
        <span>${ag.name}</span>
      </button>
    `;
  }).join("");

  const mechDetail = activeAgent
    ? `
      <div class="mt-3 p-3.5 rounded-xl bg-rose-950/25 border border-rose-800/60 text-xs text-slate-200 space-y-1.5">
        <div class="text-[10px] font-mono uppercase text-rose-400 font-bold">${activeAgent.category || "Experimental Perturbation"}</div>
        <div><strong>Mechanism / Binding Site:</strong> ${formatRichText(activeAgent.binding_site || activeAgent.mechanism_of_action || "")}</div>
        ${activeAgent.rescue_experiment ? `<div class="text-emerald-300 pt-1"><strong>CSIR Experimental Rescue / Diagnostic:</strong> ${formatRichText(activeAgent.rescue_experiment)}</div>` : ""}
      </div>
    `
    : "";

  simPanel.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
        <i class="fa-solid fa-flask-vial"></i>
        <span>CSIR Experimental Perturbation & Inhibitor Simulator</span>
      </h3>
      ${activeAgent ? `
        <button id="resetSimAgentBtn" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300">
          <i class="fa-solid fa-rotate-left mr-1"></i>Reset to Wild-Type Baseline
        </button>
      ` : `<span class="text-[11px] font-mono text-slate-400">Select an inhibitor/agent to perturb pathway</span>`}
    </div>

    <div class="flex flex-wrap gap-2 mb-3.5">
      ${agentsButtonsHtml || `<span class="text-xs text-slate-400">No inhibitor agents configured for this module.</span>`}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      ${metricsHtml}
    </div>
    ${mechDetail}
  `;

  simPanel.querySelectorAll(".sim-agent-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeSimAgentId = btn.dataset.simAgent;
      const chosen = agents.find(a => a.id === state.activeSimAgentId);
      if (chosen?.target_node && state.moduleData.nodes?.[chosen.target_node]) {
        const tNode = state.moduleData.nodes[chosen.target_node];
        state.activeScaleId = tNode.level;
        state.activeNodeId = tNode.id;
      }
      renderArgonWorkspace();
    });
  });

  document.getElementById("resetSimAgentBtn")?.addEventListener("click", () => {
    state.activeSimAgentId = null;
    renderArgonWorkspace();
  });
}

// ============================================================================
// LEFT SIDEBAR NAVIGATION (#moduleNavContainer) & PUBMED FEED (#pubmedContainer)
// ============================================================================
function renderSidebarNav(list) {
  const nav = document.getElementById("moduleNavContainer");
  const badge = document.getElementById("loadedModulesBadge");
  if (badge) badge.textContent = `${list.length} JSON Units`;
  if (!nav) return;

  nav.innerHTML = list.map(item => `
    <div data-id="${item.id}" class="mod-nav-card p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer transition">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-bold uppercase text-emerald-400">${item.shortUnit}</span>
        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
      </div>
      <div class="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">${item.title}</div>
    </div>
  `).join("");

  nav.querySelectorAll(".mod-nav-card").forEach(card => {
    card.addEventListener("click", () => loadModule(card.dataset.id));
  });
}

async function fetchPubMedArticles(queryText) {
  const box = document.getElementById("pubmedContainer");
  if (!box) return;
  box.innerHTML = `<div class="text-xs text-slate-500 animate-pulse py-2"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Fetching NCBI PubMed...</div>`;

  try {
    const clean = queryText.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 4).join(" ");
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(clean)}&retmode=json&retmax=3&sort=relevance`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    const ids = data.esearchresult?.idlist || [];

    if (!ids.length) {
      box.innerHTML = `<p class="text-xs text-slate-500 italic">No direct PubMed hits for this node.</p>`;
      return;
    }

    const sumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const sumRes = await fetch(sumUrl);
    const sumData = await sumRes.json();

    box.innerHTML = ids.map(id => {
      const doc = sumData.result?.[id];
      if (!doc) return "";
      return `
        <a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank" rel="noopener noreferrer" class="block p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 transition">
          <div class="text-xs font-semibold text-slate-200 hover:text-sky-300 line-clamp-2 leading-snug">${doc.title}</div>
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span class="truncate max-w-[130px]">${doc.source || "PubMed"}</span>
            <span>PMID: ${id}</span>
          </div>
        </a>
      `;
    }).join("");
  } catch (e) {
    box.innerHTML = `<p class="text-xs text-slate-500 italic">PubMed feed offline.</p>`;
  }
}

// ============================================================================
// UI EVENT BINDINGS (SCALE BUTTONS, DRAWER, BUNDLE MODAL, SEARCH)
// ============================================================================
function bindArgonEvents() {
  // L1 - L4 Scale Buttons
  document.querySelectorAll(".scale-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetScale = btn.dataset.scale;
      state.activeScaleId = targetScale;
      const levels = state.moduleData?.scale_levels || [];
      const lvlObj = levels.find(l => l.level_id === targetScale);
      const lvlNodes = lvlObj?.node_ids || lvlObj?.hotspots || [];
      if (lvlNodes.length) state.activeNodeId = lvlNodes[0];
      renderArgonWorkspace();
    });
  });

  // Toggle Pathway Simulator Panel (#toggleSimBtn -> #simulatorPanel)
  const simPanel = document.getElementById("simulatorPanel");
  document.getElementById("toggleSimBtn")?.addEventListener("click", () => {
    if (!simPanel) return;
    simPanel.classList.toggle("hidden");
    if (!simPanel.classList.contains("hidden")) {
      simPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  // Slide-Out Study Drawer (#openDrawerBtn, #closeDrawerBtn, #studyDrawerBackdrop)
  document.getElementById("openDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(true));
  document.getElementById("closeDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(false));
  document.getElementById("studyDrawerBackdrop")?.addEventListener("click", () => toggleStudyDrawer(false));

  // High-Yield Study Bundle Modal (#openBundleModalBtn, #closeBundleModalBtn, #bundleModal)
  const bundleModal = document.getElementById("bundleModal");
  document.getElementById("openBundleModalBtn")?.addEventListener("click", () => {
    bundleModal?.classList.remove("hidden");
    bundleModal?.classList.add("flex");
  });
  document.getElementById("closeBundleModalBtn")?.addEventListener("click", () => {
    bundleModal?.classList.add("hidden");
    bundleModal?.classList.remove("flex");
  });

  // Global Search Input (#globalModuleSearch)
  document.getElementById("globalModuleSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = MODULE_REGISTRY.filter(m =>
      m.title.toLowerCase().includes(q) || m.shortUnit.toLowerCase().includes(q)
    );
    renderSidebarNav(filtered);
  });
}

function toggleStudyDrawer(open) {
  const drawer = document.getElementById("studyDrawer");
  const backdrop = document.getElementById("studyDrawerBackdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.toggle("translate-x-full", !open);
  backdrop.classList.toggle("hidden", !open);
  setTimeout(() => backdrop.classList.toggle("opacity-0", !open), 15);
}

function formatRichText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="italic text-emerald-300">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/\n/g, "<br>");
}

function typesetMath() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(() => {});
  }
}

function getFallbackModuleData(regItem) {
  return {
    module_id: regItem.id,
    title: regItem.title,
    csir_net_units: [regItem.shortUnit],
    scale_levels: [
      {
        level_id: "L1",
        name: "Overview & Architecture",
        scale_metric: "100 nm",
        description: `Upload ${regItem.files[0]} into the /data folder on your main branch to populate this module.`,
        hotspots: ["node_fallback"]
      }
    ],
    nodes: {
      node_fallback: {
        id: "node_fallback",
        level: "L1",
        title: `${regItem.title} — JSON File Not Found on Main Branch`,
        subtitle: `Expected ./data/${regItem.files[0]} on the 'main' GitHub branch.`,
        metrics: {
          expected_path: `./data/${regItem.files[0]}`,
          fix: "Ensure your JSON files are inside the 'data/' folder on the 'main' branch (not on the separate 'data' branch)."
        },
        tabs: {
          mechanism: [`Make sure \`data/${regItem.files[0]}\` is committed to the \`main\` branch of your GitHub repository.`],
          csir_high_yield: ["Once uploaded to `main/data/`, refresh the page and your full CSIR NET module will render automatically."],
          pathology: ["No data loaded yet."],
          lab_workbench: ["No data loaded yet."]
        },
        external_resources: []
      }
    },
    inhibitor_simulator: { baseline_metrics: { status: "Awaiting JSON" }, agents: [] },
    quiz_challenges: []
  };
}