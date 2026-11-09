/**
 * ============================================================================
 * CELLULUM — Argon Engine v2.4 (True Circular Concentric Zoom & Inline Expand)
 * Supports data/module1.json, module2.json, module2b.json, module3..14.json
 * ============================================================================
 */

const APP_CONFIG = {
  name: "Cellulum",
  searchPaths: ["./data/", "./", "./modules/"]
};

const MODULE_REGISTRY = [
  { id: "module_01", shortUnit: "MOD 01", title: "Mitochondrial Bioenergetics & OxPhos", files: ["module1.json", "module_01_bioenergetics.json", "module_01.json"] },
  { id: "module_02", shortUnit: "MOD 02", title: "The Nucleus, Chromatin & Transcription", files: ["module2.json", "module_02_nucleus.json", "module_02.json"] },
  { id: "module_02b", shortUnit: "MOD 02B", title: "Core Module 2B (DNA / Metabolic)", files: ["module2b.json", "module2B.json", "module_02b.json", "module_2b.json"] },
  { id: "module_03", shortUnit: "MOD 03", title: "Protein Synthesis, Translocation & ER", files: ["module3.json", "module_03_ribosome_er.json", "module_03.json"] },
  { id: "module_04", shortUnit: "MOD 04", title: "Cell Signaling & Membrane Receptors", files: ["module4.json", "module_04_signaling.json", "module_04.json"] },
  { id: "module_05", shortUnit: "MOD 05", title: "Cytoskeleton, Motors & Cell Adhesion", files: ["module5.json", "module_05_cytoskeleton_ecm.json", "module_05.json"] },
  { id: "module_06", shortUnit: "MOD 06", title: "Cell Cycle, Mitosis & Apoptosis", files: ["module6.json", "module_06.json"] },
  { id: "module_07", shortUnit: "MOD 07", title: "DNA Replication, Repair & Recombination", files: ["module7.json", "module_07.json"] },
  { id: "module_08", shortUnit: "MOD 08", title: "Developmental Biology & Morphogenesis", files: ["module8.json", "module_08_developmental_bio_revised.json", "module_08.json"] },
  { id: "module_09", shortUnit: "MOD 09", title: "Plant Physiology & Photosynthesis", files: ["module9.json", "module_09.json"] },
  { id: "module_10", shortUnit: "MOD 10", title: "Animal Physiology & Neurobiology", files: ["module10.json", "module_10.json"] },
  { id: "module_11", shortUnit: "MOD 11", title: "Immunology & Host Defense", files: ["module11.json", "module_11.json"] },
  { id: "module_12", shortUnit: "MOD 12", title: "Inheritance Biology, Operons & Mapping", files: ["module12.json", "module_12_genetics_mapping.json"] },
  { id: "module_13", shortUnit: "MOD 13", title: "Ecological Principles & Biogeography", files: ["module13.json", "module_13_ecology.json", "module_13_ecology_revised.json"] },
  { id: "module_14", shortUnit: "MOD 14", title: "Biophysical Methods & Techniques", files: ["module14.json", "module_14_methods.json", "module_14_wetlab_biophysics.json"] }
];

const SCALE_ORDER = ["L1", "L2", "L3", "L4"];

const state = {
  activeRegistryItem: MODULE_REGISTRY[0],
  moduleData: null,
  activeScaleId: "L1",
  activeNodeId: null,
  activeTabByNode: {},
  activeDrawerTab: "mechanism",
  activeSimAgentId: null,
  quizMode: false,
  currentQuizIdx: 0,
  cache: {}
};

// ============================================================================
// INITIALIZATION & SELF-CONTAINED CIRCULAR ZOOM CSS
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  injectCircularZoomStyles();
  injectMathJaxSupport();
  renderSidebarNav(MODULE_REGISTRY);
  bindArgonEvents();
  loadModule(MODULE_REGISTRY[0].id);
});

function injectCircularZoomStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .circular-lens-viewport {
      position: relative;
      width: 310px;
      height: 310px;
      margin: 0 auto;
      border-radius: 9999px;
      background: radial-gradient(circle at center, rgba(16, 185, 129, 0.16) 0%, rgba(15, 23, 42, 0.92) 68%, rgba(2, 6, 23, 1) 100%);
      border: 2px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.18), inset 0 0 35px rgba(16, 185, 129, 0.15);
      overflow: hidden;
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
    }
    @media (min-width: 640px) {
      .circular-lens-viewport {
        width: 360px;
        height: 360px;
      }
    }
    .circular-lens-rotor {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: 50% 50%;
    }
    .concentric-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 9999px;
      border: 1px dashed rgba(148, 163, 184, 0.25);
      transition: all 0.45s ease;
      pointer-events: none;
    }
    .concentric-ring.active-ring {
      border: 2px solid var(--theme-color, #10b981);
      box-shadow: 0 0 22px var(--accent-glow, rgba(16, 185, 129, 0.4));
      background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
    }
    .radar-orb-node {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 9999px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 25;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      user-select: none;
    }
    .radar-orb-node:hover {
      transform: translate(-50%, -50%) scale(1.15);
    }
    .radar-orb-node.active-orb {
      transform: translate(-50%, -50%) scale(1.22);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.85);
      z-index: 35;
    }
    .scale-btn.active {
      background-color: #059669 !important;
      color: #ffffff !important;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.45);
    }
  `;
  document.head.appendChild(style);
}

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
// LOAD MODULE JSON
// ============================================================================
async function loadModule(registryId) {
  const regItem = MODULE_REGISTRY.find(m => m.id === registryId) || MODULE_REGISTRY[0];
  state.activeRegistryItem = regItem;
  state.activeSimAgentId = null;
  state.currentQuizIdx = 0;

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

  if (state.moduleData && state.moduleData.title) {
    regItem.title = state.moduleData.title;
    const activeCardTitle = document.querySelector(`.mod-nav-card[data-id="${regItem.id}"] .text-slate-200`);
    if (activeCardTitle) activeCardTitle.textContent = state.moduleData.title;
  }

  const root = document.documentElement;
  root.style.setProperty("--theme-color", state.moduleData.theme_color || "#10b981");
  root.style.setProperty("--accent-glow", state.moduleData.accent_glow || "rgba(16, 185, 129, 0.45)");

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
      } catch (err) {}
    }
  }
  return getFallbackModuleData(regItem);
}

// ============================================================================
// WORKSPACE COORDINATOR
// ============================================================================
function renderArgonWorkspace() {
  const mod = state.moduleData;
  const reg = state.activeRegistryItem;

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

  renderCircularZoomAndExpandableCards();
  renderNodeInspectorAndDrawer();
  renderPathwaySimulator();
  typesetMath();
}

// ============================================================================
// 1. TRUE CIRCULAR CONCENTRIC ZOOM STAGE + 2. INLINE EXPANDABLE ACCORDION CARDS
// ============================================================================
function renderCircularZoomAndExpandableCards() {
  const mod = state.moduleData;
  const levels = mod.scale_levels || [];
  const activeLvl = levels.find(l => l.level_id === state.activeScaleId) || levels[0];
  if (!activeLvl) return;

  const scaleIndex = Math.max(0, SCALE_ORDER.indexOf(state.activeScaleId));
  const opticalZoomFactor = [1.0, 1.12, 1.25, 1.4][scaleIndex] || 1.0;

  const hudLabel = document.getElementById("hudScaleLabel");
  if (hudLabel) {
    hudLabel.textContent = `${activeLvl.level_id} (${opticalZoomFactor.toFixed(2)}x Zoom): ${activeLvl.name}`;
  }

  const summaryText = document.getElementById("scaleSummaryText");
  if (summaryText) {
    summaryText.textContent = activeLvl.description || "Tap any circular node in the lens or expand any topic card below.";
  }

  const canvas = document.getElementById("hotspotCanvas");
  if (!canvas) return;

  const nodeIds = activeLvl.node_ids || activeLvl.hotspots || [];
  const activeAgent = (mod.inhibitor_simulator?.agents || []).find(a => a.id === state.activeSimAgentId);
  const quizzes = mod.quiz_challenges || [];

  // Optional Quiz Bar
  let quizHtml = "";
  if (quizzes.length > 0) {
    const q = quizzes[state.currentQuizIdx] || quizzes[0];
    quizHtml = `
      <div class="w-full mb-4 p-3.5 rounded-2xl bg-slate-950/95 border ${state.quizMode ? 'border-amber-500/80' : 'border-slate-800'} shadow-lg">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-700/60">
              <i class="fa-solid fa-bolt mr-1"></i>CSIR Quiz (${state.currentQuizIdx + 1}/${quizzes.length})
            </span>
            <span class="text-xs font-semibold text-slate-200">${state.quizMode ? "Tap the matching node orb or card!" : "Test your Part-C recall"}</span>
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

  // Build Circular Orbital Nodes along the active ring (Radius = 35% of circular viewport)
  const totalNodes = nodeIds.length || 1;
  const orbitRadiusPct = 34;

  const orbPinsHtml = nodeIds.map((nid, idx) => {
    const node = mod.nodes?.[nid];
    if (!node) return "";
    const isSelected = node.id === state.activeNodeId;
    const isPerturbed = activeAgent && activeAgent.target_node === node.id;

    const angle = (idx / totalNodes) * 2 * Math.PI - Math.PI / 2;
    const xPct = 50 + orbitRadiusPct * Math.cos(angle);
    const yPct = 50 + orbitRadiusPct * Math.sin(angle);

    return `
      <button type="button" data-orb-node="${node.id}"
              title="${node.title}"
              class="radar-orb-node ${
                isSelected
                  ? "active-orb bg-emerald-500 text-slate-950 border-2 border-white font-extrabold"
                  : "bg-slate-900/95 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-950"
              } ${isPerturbed ? "!bg-rose-600 !text-white !border-rose-200 animate-pulse" : ""}"
              style="left: ${xPct}%; top: ${yPct}%;">
        <span class="text-[10px] leading-none">${node.level}</span>
        <span class="text-[9px] leading-none mt-0.5">#${idx + 1}</span>
      </button>
    `;
  }).join("");

  // Active node short title inside the center of the circular lens
  const activeNodeObj = mod.nodes?.[state.activeNodeId] || mod.nodes?.[nodeIds[0]];

  // Build Expandable Accordion Topic Cards below the circular lens (NO floating overlap, full 4-tab content inline!)
  const expandableCardsHtml = nodeIds.map((nid, idx) => {
    const node = mod.nodes?.[nid];
    if (!node) return "";
    const isExpanded = node.id === state.activeNodeId;
    const isPerturbed = activeAgent && activeAgent.target_node === node.id;
    const activeTabKey = state.activeTabByNode[node.id] || "mechanism";

    const tabsList = [
      { key: "mechanism", label: "Mechanism", icon: "fa-gears" },
      { key: "csir_high_yield", label: "CSIR High-Yield", icon: "fa-bullseye" },
      { key: "pathology", label: "Pathology", icon: "fa-heart-pulse" },
      { key: "lab_workbench", label: "Lab Assays", icon: "fa-flask" }
    ];

    const tabParagraphs = node.tabs?.[activeTabKey] || ["No notes available for this section."];
    const metricsEntries = Object.entries(node.metrics || {});

    return `
      <div data-card-node="${node.id}" class="rounded-2xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "bg-slate-900/95 border-emerald-500 shadow-xl shadow-emerald-950/40"
          : "bg-slate-950/85 border-slate-800 hover:border-slate-700"
      } ${isPerturbed ? "ring-2 ring-rose-500 border-rose-500" : ""}">
        
        <!-- Card Header (Click anywhere here to Expand / Collapse) -->
        <div data-card-header="${node.id}" class="p-4 cursor-pointer flex items-start justify-between gap-3 select-none">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold mt-0.5 ${
              isExpanded ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"
            }">
              ${idx + 1}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                  ${node.level} • ${activeLvl.scale_metric || "Scale"}
                </span>
                ${isPerturbed ? `<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">Inhibited by ${activeAgent.name}</span>` : ""}
                ${node.next_zoom_target ? `
                  <button type="button" data-zoom-to="${node.next_zoom_target}" class="zoom-jump-chip text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-800 text-sky-300 border border-sky-700/70 transition">
                    <i class="fa-solid fa-magnifying-glass-plus mr-1"></i>Zoom Deeper (${node.next_zoom_target})
                  </button>
                ` : ""}
              </div>
              <h4 class="text-sm sm:text-base font-bold text-white leading-snug">${formatRichText(node.title)}</h4>
              <p class="text-xs text-slate-400 mt-0.5">${formatRichText(node.subtitle || "")}</p>
            </div>
          </div>

          <button type="button" class="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 shrink-0 mt-1">
            <i class="fa-solid ${isExpanded ? "fa-chevron-up text-emerald-400" : "fa-chevron-down"} text-xs"></i>
          </button>
        </div>

        <!-- Inline Expanded Body (Shows full metrics + all 4 study tabs right inside the card!) -->
        ${isExpanded ? `
          <div class="px-4 pb-4 pt-2 border-t border-slate-800/90 space-y-4">
            
            <!-- Quantitative Metrics Grid -->
            ${metricsEntries.length ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${metricsEntries.map(([k, v]) => `
                  <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90">
                    <div class="text-[10px] font-mono uppercase text-emerald-400 font-bold">${k.replace(/_/g, " ")}</div>
                    <div class="text-xs text-slate-200 mt-0.5 leading-snug">${formatRichText(String(v))}</div>
                  </div>
                `).join("")}
              </div>
            ` : ""}

            <!-- 4-Tab Switcher Inside Card -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              ${tabsList.map(t => `
                <button type="button" data-inline-node="${node.id}" data-inline-tab="${t.key}"
                        class="inline-tab-btn py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 ${
                          activeTabKey === t.key ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                        }">
                  <i class="fa-solid ${t.icon} text-[10px]"></i>
                  <span>${t.label}</span>
                </button>
              `).join("")}
            </div>

            <!-- Full Tab Content Paragraphs -->
            <div class="space-y-2.5">
              ${tabParagraphs.map(p => `
                <div class="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  ${formatRichText(p)}
                </div>
              `).join("")}
            </div>

            <!-- Action Bar: Open Full Slide-Out Drawer or Jump Scale -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
              <button type="button" data-open-drawer-for="${node.id}" class="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition">
                <i class="fa-solid fa-up-right-and-down-left-from-center mr-1.5"></i>Open in Full-Screen Study Drawer
              </button>
              ${node.next_zoom_target ? `
                <button type="button" data-zoom-to="${node.next_zoom_target}" class="zoom-jump-chip px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition">
                  <i class="fa-solid fa-magnifying-glass-plus mr-1"></i>Zoom In to ${node.next_zoom_target}
                </button>
              ` : ""}
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  canvas.innerHTML = `
    <div class="w-full flex flex-col items-center">
      ${quizHtml}

      <!-- CIRCULAR CONCENTRIC OPTICAL ZOOM STAGE -->
      <div class="w-full flex flex-col items-center my-2">
        <div class="circular-lens-viewport">
          <div id="circularLensRotor" class="circular-lens-rotor" style="transform: scale(${opticalZoomFactor});">
            <!-- 4 Concentric Scale Rings (L1 Outer -> L4 Inner) -->
            <div class="concentric-ring ${state.activeScaleId === 'L1' ? 'active-ring' : ''}" style="width: 90%; height: 90%;"></div>
            <div class="concentric-ring ${state.activeScaleId === 'L2' ? 'active-ring' : ''}" style="width: 68%; height: 68%;"></div>
            <div class="concentric-ring ${state.activeScaleId === 'L3' ? 'active-ring' : ''}" style="width: 46%; height: 46%;"></div>
            <div class="concentric-ring ${state.activeScaleId === 'L4' ? 'active-ring' : ''}" style="width: 26%; height: 26%;"></div>

            <!-- Crosshair Axes -->
            <div class="absolute inset-x-0 top-1/2 h-px bg-emerald-500/15 pointer-events-none"></div>
            <div class="absolute inset-y-0 left-1/2 w-px bg-emerald-500/15 pointer-events-none"></div>

            <!-- Orbital Node Pins -->
            ${orbPinsHtml}

            <!-- Center Microscope Core Readout -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-slate-950/90 border border-emerald-500/40 flex flex-col items-center justify-center p-2 text-center pointer-events-none shadow-inner">
              <span class="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">${activeLvl.level_id} • ${activeLvl.scale_metric || ""}</span>
              <span class="text-[11px] font-bold text-white leading-tight mt-1 line-clamp-2">${activeNodeObj ? activeNodeObj.title.split(":")[0] : activeLvl.name}</span>
            </div>
          </div>
        </div>

        <!-- Optical Zoom In / Out Controls Under Circular Viewport -->
        <div class="flex items-center space-x-2 mt-3 bg-slate-950/90 px-3 py-1.5 rounded-full border border-slate-800">
          <button type="button" id="lensZoomOutBtn" class="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-mono transition" ${scaleIndex === 0 ? "disabled style='opacity:0.4'" : ""}>
            <i class="fa-solid fa-magnifying-glass-minus mr-1"></i>Zoom Out
          </button>
          <span class="text-[11px] font-mono text-emerald-400 px-2">Scale ${state.activeScaleId} (${scaleIndex + 1}/4)</span>
          <button type="button" id="lensZoomInBtn" class="px-2.5 py-1 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-xs text-emerald-300 border border-emerald-700/60 font-mono transition" ${scaleIndex >= SCALE_ORDER.length - 1 ? "disabled style='opacity:0.4'" : ""}>
            Zoom In<i class="fa-solid fa-magnifying-glass-plus ml-1"></i>
          </button>
        </div>
      </div>

      <!-- INLINE EXPANDABLE HOTSPOT CARDS (Full Content Right Below the Lens!) -->
      <div class="w-full mt-5 space-y-3">
        <div class="flex items-center justify-between px-1">
          <span class="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            <i class="fa-solid fa-layer-group mr-1"></i>${activeLvl.level_id} Hotspot Topics (Tap any card to expand full notes)
          </span>
          <span class="text-[11px] font-mono text-slate-400">${nodeIds.length} Nodes</span>
        </div>
        ${expandableCardsHtml}
      </div>
    </div>
  `;

  // 1. Bind Circular Radar Node Clicks
  canvas.querySelectorAll("[data-orb-node]").forEach(orb => {
    orb.addEventListener("click", () => {
      const nid = orb.dataset.orbNode;
      state.activeNodeId = nid;
      renderCircularZoomAndExpandableCards();
      renderNodeInspectorAndDrawer();
      if (state.quizMode) evaluateQuizNodeSelection(nid);
      typesetMath();

      // Smoothly scroll the expanded card into view
      const targetCard = canvas.querySelector(`[data-card-node="${nid}"]`);
      targetCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  // 2. Bind Zoom In / Zoom Out Lens Buttons
  document.getElementById("lensZoomOutBtn")?.addEventListener("click", () => {
    if (scaleIndex > 0) switchScaleWithZoom(SCALE_ORDER[scaleIndex - 1]);
  });
  document.getElementById("lensZoomInBtn")?.addEventListener("click", () => {
    if (scaleIndex < SCALE_ORDER.length - 1) switchScaleWithZoom(SCALE_ORDER[scaleIndex + 1]);
  });

  // 3. Bind Accordion Card Header Clicks (Expand / Collapse Inline)
  canvas.querySelectorAll("[data-card-header]").forEach(hdr => {
    hdr.addEventListener("click", (e) => {
      const zoomChip = e.target.closest(".zoom-jump-chip");
      if (zoomChip) {
        e.stopPropagation();
        switchScaleWithZoom(zoomChip.dataset.zoomTo);
        return;
      }
      const nid = hdr.dataset.cardHeader;
      state.activeNodeId = state.activeNodeId === nid ? null : nid;
      renderCircularZoomAndExpandableCards();
      if (state.activeNodeId) {
        renderNodeInspectorAndDrawer();
        if (state.quizMode) evaluateQuizNodeSelection(nid);
      }
      typesetMath();
    });
  });

  // 4. Bind Inline 4-Tab Switcher Buttons inside Expanded Card
  canvas.querySelectorAll(".inline-tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const nid = btn.dataset.inlineNode;
      const tabKey = btn.dataset.inlineTab;
      state.activeTabByNode[nid] = tabKey;
      state.activeDrawerTab = tabKey;
      renderCircularZoomAndExpandableCards();
      renderNodeInspectorAndDrawer();
      typesetMath();
    });
  });

  // 5. Bind "Open in Full-Screen Study Drawer" Button & Deeper Zoom Chips
  canvas.querySelectorAll("[data-open-drawer-for]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.activeNodeId = btn.dataset.openDrawerFor;
      renderNodeInspectorAndDrawer();
      toggleStudyDrawer(true);
    });
  });

  canvas.querySelectorAll(".zoom-jump-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      switchScaleWithZoom(chip.dataset.zoomTo);
    });
  });

  // 6. Bind Quiz Controls
  document.getElementById("toggleQuizStageBtn")?.addEventListener("click", () => {
    state.quizMode = !state.quizMode;
    renderCircularZoomAndExpandableCards();
    typesetMath();
  });
  document.getElementById("prevQuizStageBtn")?.addEventListener("click", () => {
    state.currentQuizIdx = (state.currentQuizIdx - 1 + quizzes.length) % quizzes.length;
    renderCircularZoomAndExpandableCards();
    typesetMath();
  });
  document.getElementById("nextQuizStageBtn")?.addEventListener("click", () => {
    state.currentQuizIdx = (state.currentQuizIdx + 1) % quizzes.length;
    renderCircularZoomAndExpandableCards();
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

function switchScaleWithZoom(targetScale) {
  if (!targetScale) return;
  state.activeScaleId = targetScale;
  const levels = state.moduleData?.scale_levels || [];
  const lvlObj = levels.find(l => l.level_id === targetScale);
  const lvlNodes = lvlObj?.node_ids || lvlObj?.hotspots || [];
  if (lvlNodes.length) state.activeNodeId = lvlNodes[0];
  renderArgonWorkspace();
}

function evaluateQuizNodeSelection(clickedNodeId) {
  const quizzes = state.moduleData.quiz_challenges || [];
  const q = quizzes[state.currentQuizIdx];
  if (!q || !q.correct_node_id) return;

  const isCorrect = clickedNodeId === q.correct_node_id;
  const msg = isCorrect
    ? (q.feedback?.correct || q.explanation)
    : (q.feedback?.incorrect || `Not quite! Hint: Check scale levels for ${q.correct_node_id.replace(/_/g, " ")}.`);
  showStageQuizFeedback(isCorrect, msg);
}

function showStageQuizFeedback(isCorrect, text) {
  const box = document.getElementById("stageQuizFeedback");
  if (!box) return;
  box.classList.remove("hidden");
  box.className = `mt-2.5 p-2.5 rounded-lg text-xs border ${
    isCorrect ? "bg-emerald-950/90 border-emerald-500 text-emerald-200" : "bg-rose-950/90 border-rose-500 text-rose-200"
  }`;
  box.innerHTML = `<strong>${isCorrect ? "✓ Spot On!" : "✗ Try Again:"}</strong> ${formatRichText(text)}`;
  typesetMath();
}

// ============================================================================
// RIGHT COLUMN INSPECTOR & SLIDE-OUT STUDY DRAWER
// ============================================================================
function renderNodeInspectorAndDrawer() {
  const mod = state.moduleData;
  const fallbackId = Object.keys(mod.nodes || {})[0];
  const node = mod.nodes?.[state.activeNodeId || fallbackId];
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
        <div class="text-[10px] font-mono uppercase text-emerald-400">${node.level} Active Node</div>
        <h4 class="text-sm font-bold text-white mt-0.5">${formatRichText(node.title)}</h4>
        <p class="text-[11px] text-slate-400 mt-0.5">${formatRichText(node.subtitle || "")}</p>
      </div>
      <div class="space-y-2 my-2.5">${metricsHtml}</div>
      <div class="space-y-2 pt-2 border-t border-slate-800/80">${mechPreview}</div>
      <button id="inspectorOpenDrawerBtn" class="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition flex items-center justify-center space-x-1.5">
        <i class="fa-solid fa-book-open"></i>
        <span>Open Full Study Drawer</span>
      </button>
      ${resourcesHtml ? `<div class="space-y-1.5 pt-2.5 border-t border-slate-800/80">${resourcesHtml}</div>` : ""}
    `;

    document.getElementById("inspectorOpenDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(true));
  }

  renderSlideOutDrawer(node);
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
          state.activeDrawerTab === t.key ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
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
// SIMULATOR PANEL (KINETICS SANDBOX + CSIR INHIBITOR AGENTS)
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
        isSelected ? "bg-rose-950/90 border-rose-500 text-rose-200 shadow" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500/50"
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
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
        <i class="fa-solid fa-flask-vial"></i>
        <span id="simTitle">CSIR Experimental Perturbation & Kinetics Simulator</span>
      </h3>
      ${activeAgent ? `<button id="resetSimAgentBtn" class="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-300">Reset to Baseline</button>` : ""}
    </div>

    <div class="mb-4">
      <div class="text-[10px] font-mono uppercase text-slate-400 mb-2">Tap an Inhibitor / Perturbation Agent:</div>
      <div class="flex flex-wrap gap-2 mb-3">
        ${agentsButtonsHtml || `<span class="text-xs text-slate-400">No inhibitor agents configured for this module.</span>`}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        ${metricsHtml}
      </div>
      ${mechDetail}
    </div>

    <div class="pt-3 border-t border-slate-800">
      <div class="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-2">Michaelis-Menten Enzyme Kinetics Sandbox</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Substrate $[S]$ (<span id="subVal">50</span> µM)</label>
          <input type="range" id="simSubstrate" min="1" max="200" value="50" class="w-full accent-emerald-500">
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Competitive Inhibitor $[I]$ (<span id="inhVal">0</span> µM)</label>
          <input type="range" id="simInhibitor" min="0" max="100" value="0" class="w-full accent-amber-500">
        </div>
      </div>
      <div id="simCalculatedOutput" class="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
        Reaction Velocity (V0): 71.4 µmol/min | Apparent Km: 20.0 µM
      </div>
    </div>
  `;

  const subSlider = document.getElementById("simSubstrate");
  const inhSlider = document.getElementById("simInhibitor");
  const subVal = document.getElementById("subVal");
  const inhVal = document.getElementById("inhVal");
  const outBox = document.getElementById("simCalculatedOutput");

  const updateKinetics = () => {
    const S = Number(subSlider?.value || 50);
    const I = Number(inhSlider?.value || 0);
    if (subVal) subVal.textContent = S;
    if (inhVal) inhVal.textContent = I;
    const apparentKm = 20 * (1 + I / 25);
    const v0 = (100 * S) / (apparentKm + S);
    if (outBox) {
      outBox.textContent = `Reaction Velocity (V0): ${v0.toFixed(1)} µmol/min | Apparent Km: ${apparentKm.toFixed(1)} µM`;
    }
  };

  subSlider?.addEventListener("input", updateKinetics);
  inhSlider?.addEventListener("input", updateKinetics);

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
// SIDEBAR & PUBMED
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
// UI EVENT BINDINGS
// ============================================================================
function bindArgonEvents() {
  document.querySelectorAll(".scale-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchScaleWithZoom(btn.dataset.scale);
    });
  });

  const simPanel = document.getElementById("simulatorPanel");
  document.getElementById("toggleSimBtn")?.addEventListener("click", () => {
    if (!simPanel) return;
    simPanel.classList.toggle("hidden");
    if (!simPanel.classList.contains("hidden")) {
      simPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  document.getElementById("openDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(true));
  document.getElementById("closeDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(false));
  document.getElementById("studyDrawerBackdrop")?.addEventListener("click", () => toggleStudyDrawer(false));

  const bundleModal = document.getElementById("bundleModal");
  document.getElementById("openBundleModalBtn")?.addEventListener("click", () => {
    bundleModal?.classList.remove("hidden");
    bundleModal?.classList.add("flex");
  });
  document.getElementById("closeBundleModalBtn")?.addEventListener("click", () => {
    bundleModal?.classList.add("hidden");
    bundleModal?.classList.remove("flex");
  });

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
        description: `Upload ${regItem.files[0]} into the /data folder on your main branch.`,
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
          fix: "Ensure your JSON files are inside the 'data/' folder on the 'main' branch."
        },
        tabs: {
          mechanism: [`Make sure \`data/${regItem.files[0]}\` is committed to the \`main\` branch.`],
          csir_high_yield: ["Once uploaded to `main/data/`, refresh the page."],
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
// ============================================================================
// DEEP CROSS-MODULE SEARCH ENGINE (DESKTOP + MOBILE SEARCH BUTTON & MODAL)
// ============================================================================
(function initCellulumDeepSearch() {
  let fullSearchIndex = [];
  let isIndexing = false;
  let isIndexed = false;

  document.addEventListener("DOMContentLoaded", () => {
    injectMobileSearchButtonAndModal();
    setTimeout(buildGlobalSearchIndex, 1200); // Index all 15 JSONs quietly in background
  });

  function injectMobileSearchButtonAndModal() {
    // 1. Add visible Search Button in Top Header (especially for Mobile where input is hidden)
    const bundleBtn = document.getElementById("openBundleModalBtn");
    if (bundleBtn && bundleBtn.parentElement) {
      const mobileSearchBtn = document.createElement("button");
      mobileSearchBtn.id = "openSearchModalBtn";
      mobileSearchBtn.type = "button";
      mobileSearchBtn.className = "px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 transition shadow";
      mobileSearchBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><span>Search</span>`;
      bundleBtn.parentElement.insertBefore(mobileSearchBtn, bundleBtn);

      mobileSearchBtn.addEventListener("click", () => toggleSearchModal(true));
    }

    // 2. Also open the deep search modal if user clicks or types in the desktop search bar
    const desktopInput = document.getElementById("globalModuleSearch");
    if (desktopInput) {
      desktopInput.addEventListener("focus", () => {
        toggleSearchModal(true);
        const modalInput = document.getElementById("deepSearchInput");
        if (modalInput && desktopInput.value) {
          modalInput.value = desktopInput.value;
          runDeepSearchQuery(desktopInput.value);
        }
      });
    }

    // 3. Create Full-Screen / Overlay Deep Search Modal
    const modal = document.createElement("div");
    modal.id = "deepSearchModal";
    modal.className = "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden items-start justify-center p-3 sm:p-6 pt-14 sm:pt-20";
    modal.innerHTML = `
      <div class="w-full max-w-2xl rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        <!-- Search Input Bar -->
        <div class="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-2.5">
          <i class="fa-solid fa-magnifying-glass text-emerald-400 text-sm ml-1"></i>
          <input type="text" id="deepSearchInput" placeholder="Search any enzyme, inhibitor, equation, pathway, or CSIR topic..."
                 class="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-medium" autocomplete="off">
          <button type="button" id="clearDeepSearchBtn" class="hidden px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800">Clear</button>
          <button type="button" id="closeDeepSearchBtn" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Quick Filter Chips -->
        <div class="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
          <span class="text-slate-500 shrink-0">Try:</span>
          <button type="button" data-quick-term="Rotenone" class="quick-search-chip px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950 text-emerald-300 border border-slate-800 shrink-0">Rotenone</button>
          <button type="button" data-quick-term="TaqMan" class="quick-search-chip px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950 text-emerald-300 border border-slate-800 shrink-0">TaqMan</button>
          <button type="button" data-quick-term="Lotka-Volterra" class="quick-search-chip px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950 text-emerald-300 border border-slate-800 shrink-0">Lotka-Volterra</button>
          <button type="button" data-quick-term="Ramachandran" class="quick-search-chip px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950 text-emerald-300 border border-slate-800 shrink-0">Ramachandran</button>
          <button type="button" data-quick-term="Hardy-Weinberg" class="quick-search-chip px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-950 text-emerald-300 border border-slate-800 shrink-0">Hardy-Weinberg</button>
        </div>

        <!-- Results Container -->
        <div id="deepSearchResults" class="p-3.5 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          <div class="text-center py-8 text-xs text-slate-400">
            Type above to search across all <strong>15 CSIR NET Modules</strong> (nodes, mechanisms, Part-C traps & inhibitors).
          </div>
        </div>

        <!-- Footer Status -->
        <div class="px-4 py-2 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span id="searchIndexStatus">Indexing 15 modules...</span>
          <span>Tap any result to jump straight to that scale & node</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const inputEl = document.getElementById("deepSearchInput");
    const clearBtn = document.getElementById("clearDeepSearchBtn");

    inputEl?.addEventListener("input", (e) => {
      const val = e.target.value;
      clearBtn?.classList.toggle("hidden", !val.length);
      runDeepSearchQuery(val);
    });

    clearBtn?.addEventListener("click", () => {
      if (inputEl) {
        inputEl.value = "";
        clearBtn.classList.add("hidden");
        runDeepSearchQuery("");
        inputEl.focus();
      }
    });

    document.getElementById("closeDeepSearchBtn")?.addEventListener("click", () => toggleSearchModal(false));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) toggleSearchModal(false);
    });

    modal.querySelectorAll(".quick-search-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        if (inputEl) {
          inputEl.value = chip.dataset.quickTerm;
          clearBtn?.classList.remove("hidden");
          runDeepSearchQuery(chip.dataset.quickTerm);
        }
      });
    });

    // Keyboard shortcut: Ctrl+K or / to open search
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearchModal(true);
      } else if (e.key === "Escape") {
        toggleSearchModal(false);
      }
    });
  }

  function toggleSearchModal(open) {
    const modal = document.getElementById("deepSearchModal");
    if (!modal) return;
    modal.classList.toggle("hidden", !open);
    modal.classList.toggle("flex", open);
    if (open) {
      if (!isIndexed && !isIndexing) buildGlobalSearchIndex();
      setTimeout(() => document.getElementById("deepSearchInput")?.focus(), 50);
    }
  }

  async function buildGlobalSearchIndex() {
    if (isIndexed || isIndexing) return;
    isIndexing = true;
    const statusEl = document.getElementById("searchIndexStatus");
    if (statusEl) statusEl.textContent = "Scanning all 15 JSON modules...";

    const entries = [];
    for (const regItem of MODULE_REGISTRY) {
      try {
        let modData = state.cache[regItem.id];
        if (!modData) {
          modData = await fetchJsonFromPaths(regItem);
          state.cache[regItem.id] = modData;
        }
        if (!modData || !modData.nodes) continue;

        // Update sidebar title while we have it loaded!
        if (modData.title) {
          regItem.title = modData.title;
          const cardTitle = document.querySelector(`.mod-nav-card[data-id="${regItem.id}"] .text-slate-200`);
          if (cardTitle) cardTitle.textContent = modData.title;
        }

        // Index every Hotspot Node
        Object.values(modData.nodes).forEach(node => {
          if (node.id === "node_fallback") return;
          const metricsText = Object.entries(node.metrics || {}).map(([k, v]) => `${k}: ${v}`).join(" | ");
          const mechText = (node.tabs?.mechanism || []).join(" ");
          const csirText = (node.tabs?.csir_high_yield || []).join(" ");
          const pathText = (node.tabs?.pathology || []).join(" ");
          const labText = (node.tabs?.lab_workbench || []).join(" ");

          entries.push({
            type: "NODE",
            moduleId: regItem.id,
            shortUnit: regItem.shortUnit,
            moduleTitle: modData.title || regItem.title,
            scaleId: node.level || "L1",
            nodeId: node.id,
            title: node.title || "",
            subtitle: node.subtitle || "",
            searchableBlob: `${regItem.shortUnit} ${modData.title} ${node.title} ${node.subtitle} ${metricsText} ${mechText} ${csirText} ${pathText} ${labText}`.toLowerCase(),
            rawSnippets: [node.subtitle, metricsText, csirText, mechText].filter(Boolean).join(" • ")
          });
        });

        // Index every Inhibitor / Simulator Agent
        (modData.inhibitor_simulator?.agents || []).forEach(ag => {
          entries.push({
            type: "SIMULATOR",
            moduleId: regItem.id,
            shortUnit: regItem.shortUnit,
            moduleTitle: modData.title || regItem.title,
            scaleId: modData.nodes?.[ag.target_node]?.level || "L1",
            nodeId: ag.target_node || null,
            simAgentId: ag.id,
            title: `${ag.name} (${ag.category || "Inhibitor / Perturbation"})`,
            subtitle: ag.mechanism_of_action || ag.binding_site || "",
            searchableBlob: `${ag.name} ${ag.category} ${ag.mechanism_of_action} ${ag.binding_site} ${ag.rescue_experiment}`.toLowerCase(),
            rawSnippets: `${ag.mechanism_of_action || ""} • ${ag.rescue_experiment || ""}`
          });
        });
      } catch (e) {}
    }

    fullSearchIndex = entries;
    isIndexed = true;
    isIndexing = false;
    if (statusEl) statusEl.textContent = `Indexed ${entries.length} nodes & simulators across 15 modules`;
  }

  function runDeepSearchQuery(rawQuery) {
    const box = document.getElementById("deepSearchResults");
    if (!box) return;

    const q = (rawQuery || "").toLowerCase().trim();
    if (!q) {
      box.innerHTML = `
        <div class="text-center py-8 text-xs text-slate-400">
          Type any keyword above to search across all <strong>${fullSearchIndex.length || "150+"}</strong> CSIR NET nodes, equations, and inhibitor experiments.
        </div>
      `;
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);
    const matches = fullSearchIndex
      .map(item => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const subLower = item.subtitle.toLowerCase();

        for (const t of terms) {
          if (!item.searchableBlob.includes(t)) return null; // All terms must match
          if (titleLower.includes(t)) score += 10;
          else if (subLower.includes(t)) score += 5;
          else score += 2;
        }
        return { item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    if (!matches.length) {
      box.innerHTML = `<div class="text-center py-8 text-xs text-rose-300">No matches found for "<strong>${rawQuery}</strong>". Try a broader enzyme or pathway name.</div>`;
      return;
    }

    box.innerHTML = matches.map(({ item }, idx) => {
      const snippet = buildHighlightedSnippet(item.rawSnippets, terms[0]);
      const badgeColor = item.type === "SIMULATOR"
        ? "bg-rose-950 text-rose-300 border-rose-700/60"
        : "bg-emerald-950 text-emerald-300 border-emerald-700/60";

      return `
        <div data-res-idx="${idx}" class="deep-search-hit p-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition">
          <div class="flex flex-wrap items-center justify-between gap-1.5 mb-1">
            <div class="flex items-center space-x-1.5">
              <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${badgeColor}">
                ${item.type === "SIMULATOR" ? "Inhibitor Sim" : `${item.shortUnit} • ${item.scaleId}`}
              </span>
              <span class="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">${item.moduleTitle}</span>
            </div>
            <span class="text-[10px] font-mono text-emerald-400">Jump <i class="fa-solid fa-arrow-right ml-0.5"></i></span>
          </div>
          <div class="text-xs sm:text-sm font-bold text-white leading-snug">${formatRichText(item.title)}</div>
          <div class="text-[11px] text-slate-400 mt-1 line-clamp-2">${snippet}</div>
        </div>
      `;
    }).join("");

    box.querySelectorAll(".deep-search-hit").forEach(el => {
      el.addEventListener("click", async () => {
        const hit = matches[Number(el.dataset.resIdx)]?.item;
        if (!hit) return;
        toggleSearchModal(false);

        await loadModule(hit.moduleId);
        state.activeScaleId = hit.scaleId || "L1";
        if (hit.nodeId) state.activeNodeId = hit.nodeId;
        if (hit.simAgentId) {
          state.activeSimAgentId = hit.simAgentId;
          document.getElementById("simulatorPanel")?.classList.remove("hidden");
        }
        renderArgonWorkspace();

        setTimeout(() => {
          const targetEl = hit.simAgentId
            ? document.getElementById("simulatorPanel")
            : document.querySelector(`[data-card-node="${hit.nodeId}"]`);
          targetEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      });
    });
  }

  function buildHighlightedSnippet(text, term) {
    if (!text) return "";
    const clean = text.replace(/\*\*/g, "");
    const idx = clean.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return clean.slice(0, 140) + "...";
    const start = Math.max(0, idx - 45);
    const end = Math.min(clean.length, idx + 95);
    const slice = (start > 0 ? "..." : "") + clean.slice(start, end) + (end < clean.length ? "..." : "");
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return slice.replace(regex, `<strong class="text-emerald-300 underline">$1</strong>`);
  }
})();

// ============================================================================
// UI REFINEMENT PACK (V4.2 - AUDITED & FIXED):
// Hooks directly into card expansion & tab switching so the Ultrastructure SVG
// never disappears and the inline CSIR Quiz / L1-L4 labels never reappear!
// ============================================================================
(function initCellulumRefinements() {
  const FALLBACK_METRICS = ["500 μm", "50 μm", "1.5 μm", "8 nm"];
  let simExpanded = false;
  let selectedSimNodeId = null;
  let activeCsirHubTab = "traps";

  document.addEventListener("DOMContentLoaded", () => {
    injectBioSchematicStyles();
    setupLockScreenModuleCarousel();
    cleanUpStageHudAndButtons();
    installCoreRenderHooks();
  });

  function injectBioSchematicStyles() {
    if (document.getElementById("bioSchematicCss")) return;
    const style = document.createElement("style");
    style.id = "bioSchematicCss";
    style.textContent = `
      .circular-lens-viewport,
      .circular-lens-viewport + div,
      #openDrawerBtn,
      #toggleSimBtn,
      #toggleQuizStageBtn,
      #prevQuizStageBtn,
      #nextQuizStageBtn {
        display: none !important;
      }
      #interactiveStage {
        min-height: auto !important;
        padding: 1rem !important;
      }
      .bio-region-stage {
        background: radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.92) 70%, rgba(2, 6, 23, 0.98) 100%);
        border: 1px solid rgba(255, 255, 255, 0.22);
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 10px 28px rgba(0, 0, 0, 0.65);
      }
      @keyframes bioPulseGlow {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 0.95; transform: scale(1.06); }
      }
      .bio-pin-pulse {
        animation: bioPulseGlow 2.2s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanUpStageHudAndButtons() {
    const oldSimBtn = document.getElementById("toggleSimBtn");
    if (oldSimBtn) oldSimBtn.style.display = "none";

    const openDrawerBtn = document.getElementById("openDrawerBtn");
    if (openDrawerBtn) openDrawerBtn.style.display = "none";

    const hudLabel = document.getElementById("hudScaleLabel");
    if (hudLabel && hudLabel.parentElement) {
      hudLabel.parentElement.className = "w-full bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs flex items-center space-x-2.5 shadow";
    }

    const simPanel = document.getElementById("simulatorPanel");
    if (simPanel) simPanel.classList.remove("hidden");
  }

  function setupLockScreenModuleCarousel() {
    const nav = document.getElementById("moduleNavContainer");
    if (!nav || !nav.parentElement || document.getElementById("modCarouselPrev")) return;

    const controlsBar = document.createElement("div");
    controlsBar.className = "flex items-center justify-between mb-2 px-1 text-[11px] font-mono text-emerald-300";
    controlsBar.innerHTML = `
      <button type="button" id="modCarouselPrev" class="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 shadow">
        <i class="fa-solid fa-chevron-left mr-1"></i>Prev
      </button>
      <span id="modCarouselIndicator" class="text-[10px] text-slate-300 tracking-wider uppercase">
        <i class="fa-solid fa-hand-pointer mr-1 text-emerald-400"></i>Swipe Topics
      </span>
      <button type="button" id="modCarouselNext" class="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 shadow">
        Next<i class="fa-solid fa-chevron-right ml-1"></i>
      </button>
    `;
    nav.parentElement.insertBefore(controlsBar, nav);

    const stepModule = (dir) => {
      const idx = MODULE_REGISTRY.findIndex(m => m.id === state.activeRegistryItem?.id);
      const nextIdx = (idx + dir + MODULE_REGISTRY.length) % MODULE_REGISTRY.length;
      const targetMod = MODULE_REGISTRY[nextIdx];
      if (targetMod) {
        selectedSimNodeId = null;
        loadModule(targetMod.id);
        setTimeout(() => {
          const card = nav.querySelector(`.mod-nav-card[data-id="${targetMod.id}"]`);
          card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }, 60);
      }
    };

    document.getElementById("modCarouselPrev")?.addEventListener("click", () => stepModule(-1));
    document.getElementById("modCarouselNext")?.addEventListener("click", () => stepModule(1));
  }

  function extractPureMetric(lvlObj, idx) {
    const raw = (lvlObj?.scale_metric || FALLBACK_METRICS[idx] || "10 nm").trim();
    const cleaned = raw.split("(")[0].split("–")[0].split("-")[0].trim();
    return cleaned || FALLBACK_METRICS[idx] || "10 nm";
  }

  function renderPureMetricSliderAndCleanStage() {
    const mod = state.moduleData;
    if (!mod) return;
    const levels = mod.scale_levels || [];
    const activeIdx = Math.max(0, levels.findIndex(l => l.level_id === state.activeScaleId));
    const activeLvl = levels[activeIdx] || levels[0];
    const currentMetric = extractPureMetric(activeLvl, activeIdx);

    const switcher = document.querySelector(".scale-switcher");
    if (switcher) {
      switcher.className = "scale-switcher metric-scale-slider-wrap flex flex-col";
      switcher.innerHTML = `
        <div class="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span class="text-slate-300 uppercase tracking-wider">Optical Scale:</span>
          <span id="liveMetricReadout" class="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400/50 font-bold shadow">
            ${currentMetric}
          </span>
        </div>
        <input type="range" id="pureMetricScaleSlider" min="0" max="${Math.max(0, levels.length - 1)}" step="1" value="${activeIdx}" class="aero-range-slider">
        <div class="flex items-center justify-between text-[10px] font-mono text-slate-300 mt-1.5 px-0.5">
          ${levels.map((l, i) => `
            <button type="button" data-scale-idx="${i}" class="metric-tick-btn transition ${
              i === activeIdx ? "text-emerald-300 font-bold underline" : "text-slate-400 hover:text-white"
            }">
              ${extractPureMetric(l, i)}
            </button>
          `).join("")}
        </div>
      `;

      document.getElementById("pureMetricScaleSlider")?.addEventListener("input", (e) => {
        const chosenLvl = levels[Number(e.target.value)];
        if (chosenLvl && chosenLvl.level_id !== state.activeScaleId) {
          switchScaleWithZoom(chosenLvl.level_id);
        }
      });

      switcher.querySelectorAll(".metric-tick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const chosenLvl = levels[Number(btn.dataset.scaleIdx)];
          if (chosenLvl) switchScaleWithZoom(chosenLvl.level_id);
        });
      });
    }

    // Always keep the top HUD label showing Pure Metric + Level Name (never "L2 (1.12x Zoom)")
    const hudLabel = document.getElementById("hudScaleLabel");
    if (hudLabel && activeLvl) {
      hudLabel.textContent = `${currentMetric} • ${activeLvl.name}`;
    }

    const canvas = document.getElementById("hotspotCanvas");
    if (canvas) {
      // Permanently strip any inline CSIR Quiz box from the main canvas
      canvas.querySelectorAll(".w-full.mb-4").forEach(el => {
        if (el.textContent.includes("CSIR Quiz") || el.textContent.includes("Test your Part-C")) {
          el.remove();
        }
      });

      // Remove the CSIR High-Yield tab from general topic cards so cards show 3 universal science tabs
      canvas.querySelectorAll('.inline-tab-btn[data-inline-tab="csir_high_yield"]').forEach(btn => {
        const tabGrid = btn.parentElement;
        btn.remove();
        if (tabGrid) {
          tabGrid.classList.remove("sm:grid-cols-4");
          tabGrid.classList.add("sm:grid-cols-3");
        }
      });

      // Strip L1-L4 text from badges and headers inside the topic cards
      canvas.querySelectorAll("span").forEach(sp => {
        if (/L[1-4]\b/.test(sp.textContent)) {
          sp.textContent = sp.textContent
            .replace(/L[1-4]\s*•\s*/g, "")
            .replace(/L[1-4]\s+Hotspot/gi, `${currentMetric} • Hotspot`);
        }
      });

      canvas.querySelectorAll(".zoom-jump-chip").forEach(chip => {
        const targetId = chip.dataset.zoomTo;
        const targetIdx = levels.findIndex(l => l.level_id === targetId);
        if (targetIdx !== -1) {
          const targetMetric = extractPureMetric(levels[targetIdx], targetIdx);
          chip.innerHTML = `<i class="fa-solid fa-magnifying-glass-plus mr-1"></i>Zoom to ${targetMetric}`;
        }
      });
    }
  }

  function renderBiologicalRegionSvgViewport() {
    const canvas = document.getElementById("hotspotCanvas");
    const mod = state.moduleData;
    if (!canvas || !mod) return;

    const levels = mod.scale_levels || [];
    const activeIdx = Math.max(0, levels.findIndex(l => l.level_id === state.activeScaleId));
    const activeLvl = levels[activeIdx] || levels[0];
    if (!activeLvl) return;

    const currentMetric = extractPureMetric(activeLvl, activeIdx);
    const nodeIds = activeLvl.node_ids || activeLvl.hotspots || [];
    const activeAgent = (mod.inhibitor_simulator?.agents || []).find(a => a.id === state.activeSimAgentId);

    const pinPositions = [{ x: 145, y: 78 }, { x: 310, y: 118 }, { x: 465, y: 82 }, { x: 230, y: 142 }, { x: 390, y: 68 }];

    const svgPinsHtml = nodeIds.map((nid, idx) => {
      const node = mod.nodes?.[nid];
      if (!node) return "";
      const pt = pinPositions[idx % pinPositions.length];
      const isSelected = node.id === state.activeNodeId;
      const isPerturbed = activeAgent && activeAgent.target_node === node.id;
      const shortLabel = (node.title || `Site ${idx + 1}`).split(":")[0].split("(")[0].trim().slice(0, 18);

      const fillCol = isPerturbed ? "#e11d48" : isSelected ? "#10b981" : "#0f172a";
      const strokeCol = isPerturbed ? "#fda4af" : isSelected ? "#ffffff" : "#34d399";

      return `
        <g class="bio-svg-pin cursor-pointer" data-bio-pin="${node.id}">
          <line x1="${pt.x}" y1="${pt.y}" x2="${pt.x}" y2="${pt.y + 24}" stroke="${strokeCol}" stroke-width="1.5" stroke-dasharray="2 2" />
          <circle cx="${pt.x}" cy="${pt.y + 24}" r="3.5" fill="${strokeCol}" />
          ${isSelected ? `<circle cx="${pt.x}" cy="${pt.y}" r="22" fill="rgba(16, 185, 129, 0.25)" class="bio-pin-pulse" />` : ""}
          <rect x="${pt.x - 68}" y="${pt.y - 15}" width="136" height="28" rx="14"
                fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isSelected ? '2.2' : '1.3'}" />
          <text x="${pt.x}" y="${pt.y + 3}" text-anchor="middle" fill="#ffffff" font-size="10" font-family="sans-serif" font-weight="bold">
            ${idx + 1}. ${shortLabel}
          </text>
        </g>
      `;
    }).join("");

    const quickPillsHtml = nodeIds.map((nid, idx) => {
      const node = mod.nodes?.[nid];
      if (!node) return "";
      const isSelected = node.id === state.activeNodeId;
      const shortTitle = (node.title || "").split(":")[0].trim();
      return `
        <button type="button" data-bio-pill="${node.id}" class="px-3 py-1 rounded-full text-[11px] font-semibold border transition shrink-0 ${
          isSelected
            ? "bg-emerald-600 text-white border-white shadow-md"
            : "bg-slate-950/85 text-slate-300 border-white/15 hover:border-emerald-400"
        }">
          <span class="font-mono text-[10px] mr-1 opacity-80">#${idx + 1}</span>${shortTitle}
        </button>
      `;
    }).join("");

    let banner = document.getElementById("bioRegionSvgContainer");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "bioRegionSvgContainer";
      banner.className = "w-full mb-3";
      const firstChild = canvas.firstElementChild;
      if (firstChild) {
        firstChild.insertBefore(banner, firstChild.firstChild);
      } else {
        canvas.prepend(banner);
      }
    }

    banner.innerHTML = `
      <div class="bio-region-stage rounded-2xl p-3 overflow-hidden">
        <div class="flex items-center justify-between mb-1.5 px-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
            <i class="fa-solid fa-microscope mr-1.5"></i>Ultrastructure Cross-Section (${currentMetric})
          </span>
          <span class="text-[10px] font-mono text-slate-400">Tap any region pin to inspect</span>
        </div>
        <div class="w-full overflow-x-auto rounded-xl bg-slate-950/75 border border-white/10">
          <svg viewBox="0 0 600 185" class="w-full h-auto min-w-[440px]">
            ${buildScaleBiologicalArtwork(activeIdx)}
            ${svgPinsHtml}
          </svg>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
          ${quickPillsHtml}
        </div>
      </div>
    `;

    const selectNodeFromRegion = (nid) => {
      state.activeNodeId = nid;
      window.renderCircularZoomAndExpandableCards();
      window.renderNodeInspectorAndDrawer();
      setTimeout(() => canvas.querySelector(`[data-card-node="${nid}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
    };

    banner.querySelectorAll("[data-bio-pin]").forEach(el => {
      el.addEventListener("click", () => selectNodeFromRegion(el.dataset.bioPin));
    });
    banner.querySelectorAll("[data-bio-pill]").forEach(el => {
      el.addEventListener("click", () => selectNodeFromRegion(el.dataset.bioPill));
    });
  }

  function buildScaleBiologicalArtwork(scaleIdx) {
    if (scaleIdx === 0) {
      return `
        <defs><linearGradient id="orgOuter" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(16, 185, 129, 0.22)" /><stop offset="100%" stop-color="rgba(2, 132, 199, 0.18)" /></linearGradient></defs>
        <text x="16" y="20" fill="#64748b" font-size="9" font-family="monospace">CYTOSOL / EXTRACELLULAR COMPARTMENT</text>
        <ellipse cx="300" cy="100" rx="255" ry="68" fill="url(#orgOuter)" stroke="#10b981" stroke-width="2.5" />
        <path d="M 75,100 Q 115,45 145,100 T 215,100 T 285,100 T 355,100 T 425,100 T 495,100" fill="none" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.7" />
        <path d="M 90,115 Q 135,155 180,110 T 270,115 T 360,110 T 450,115 T 515,100" fill="none" stroke="#34d399" stroke-width="1.8" stroke-dasharray="5 3" stroke-opacity="0.65" />
        <text x="300" y="162" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">LUMEN / MATRIX / INTERIOR COMPARTMENT</text>
      `;
    }
    if (scaleIdx === 1) {
      let headsTop = "", headsBot = "";
      for (let x = 25; x <= 575; x += 18) {
        headsTop += `<circle cx="${x}" cy="66" r="5.5" fill="#38bdf8" fill-opacity="0.55" stroke="#7dd3fc" stroke-width="1" /><line x1="${x - 2}" y1="72" x2="${x - 3}" y2="92" stroke="#fbbf24" stroke-width="1.2" stroke-opacity="0.55" /><line x1="${x + 2}" y1="72" x2="${x + 3}" y2="92" stroke="#fbbf24" stroke-width="1.2" stroke-opacity="0.55" />`;
        headsBot += `<circle cx="${x}" cy="122" r="5.5" fill="#38bdf8" fill-opacity="0.55" stroke="#7dd3fc" stroke-width="1" /><line x1="${x - 2}" y1="116" x2="${x - 3}" y2="96" stroke="#fbbf24" stroke-width="1.2" stroke-opacity="0.55" /><line x1="${x + 2}" y1="116" x2="${x + 3}" y2="96" stroke="#fbbf24" stroke-width="1.2" stroke-opacity="0.55" />`;
      }
      return `
        <text x="16" y="20" fill="#7dd3fc" font-size="9" font-family="monospace">P-SIDE (IMS / EXTRACELLULAR / HIGH [H+])</text>
        ${headsTop}${headsBot}
        <rect x="120" y="50" width="52" height="88" rx="12" fill="rgba(16, 185, 129, 0.35)" stroke="#34d399" stroke-width="2" />
        <rect x="280" y="46" width="64" height="96" rx="14" fill="rgba(14, 165, 233, 0.35)" stroke="#38bdf8" stroke-width="2" />
        <rect x="440" y="52" width="54" height="84" rx="12" fill="rgba(168, 85, 247, 0.35)" stroke="#c084fc" stroke-width="2" />
        <text x="16" y="172" fill="#6ee7b7" font-size="9" font-family="monospace">N-SIDE (MATRIX / CYTOSOL / ΔΨm SIGNALING)</text>
      `;
    }
    if (scaleIdx === 2) {
      return `
        <text x="16" y="20" fill="#a7f3d0" font-size="9" font-family="monospace">MACROMOLECULAR QUATERNARY ASSEMBLY & TRANSLOCATION CHANNEL</text>
        <line x1="20" y1="130" x2="580" y2="130" stroke="#334155" stroke-width="8" stroke-linecap="round" />
        <ellipse cx="200" cy="85" rx="68" ry="42" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2" />
        <ellipse cx="300" cy="78" rx="52" ry="48" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" />
        <ellipse cx="400" cy="85" rx="68" ry="42" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2" />
        <rect x="282" y="95" width="36" height="65" rx="8" fill="rgba(245, 158, 11, 0.3)" stroke="#fbbf24" stroke-width="2" />
        <path d="M 100,90 C 200,30 400,30 500,90" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="6 4" class="svg-flux-active" />
      `;
    }
    return `
      <text x="16" y="20" fill="#fde68a" font-size="9" font-family="monospace">ATOMIC CATALYTIC POCKET • COFACTOR & H-BOND COORDINATION</text>
      <path d="M 90,35 Q 300,175 510,35" fill="rgba(15, 23, 42, 0.65)" stroke="#38bdf8" stroke-width="2.5" />
      <line x1="160" y1="75" x2="300" y2="105" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3" />
      <line x1="440" y1="75" x2="300" y2="105" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3" />
      <line x1="300" y1="45" x2="300" y2="105" stroke="#34d399" stroke-width="2" stroke-dasharray="4 3" />
      <circle cx="300" cy="105" r="22" fill="rgba(245, 158, 11, 0.28)" stroke="#fbbf24" stroke-width="2" />
      <text x="300" y="109" text-anchor="middle" fill="#fef3c7" font-size="10" font-family="monospace" font-weight="bold">Mg²⁺/Fe</text>
    `;
  }

  function renderConsolidatedCsirHubCard() {
    const inspector = document.getElementById("nodeInspectorContent");
    const mod = state.moduleData;
    if (!inspector || !mod) return;

    const headerH3 = inspector.previousElementSibling;
    if (headerH3 && headerH3.tagName === "H3") {
      headerH3.innerHTML = `<i class="fa-solid fa-graduation-cap text-amber-400"></i><span>CSIR NET Part-C Exam Hub & Quiz</span>`;
    }

    const fallbackId = Object.keys(mod.nodes || {})[0];
    const node = mod.nodes?.[state.activeNodeId || fallbackId];
    const quizzes = mod.quiz_challenges || [];
    const currentQuiz = quizzes[state.currentQuizIdx] || quizzes[0];

    const hubTabsHtml = `
      <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-white/15 mb-3">
        <button type="button" data-csir-hub-tab="traps" class="py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 ${activeCsirHubTab === "traps" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}">
          <i class="fa-solid fa-bullseye text-[10px]"></i><span>Part-C Traps</span>
        </button>
        <button type="button" data-csir-hub-tab="quiz" class="py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 ${activeCsirHubTab === "quiz" ? "bg-amber-600 text-slate-950 font-bold shadow" : "text-amber-300/80 hover:text-amber-200"}">
          <i class="fa-solid fa-bolt text-[10px]"></i><span>Quiz (${quizzes.length ? `${state.currentQuizIdx + 1}/${quizzes.length}` : "0"})</span>
        </button>
        <button type="button" data-csir-hub-tab="drawer" class="py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 ${activeCsirHubTab === "drawer" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}">
          <i class="fa-solid fa-book-open text-[10px]"></i><span>Ref & 3D</span>
        </button>
      </div>
    `;

    let bodyHtml = "";
    if (activeCsirHubTab === "traps" && node) {
      const highYieldNotes = node.tabs?.csir_high_yield || ["Select any topic card above to view its CSIR NET Part-C analytical traps."];
      bodyHtml = `
        <div class="pb-2 mb-2 border-b border-white/10">
          <span class="text-[10px] font-mono uppercase text-emerald-400">Active Topic High-Yield Focus</span>
          <h4 class="text-xs sm:text-sm font-bold text-white mt-0.5">${formatRichText(node.title)}</h4>
        </div>
        <div class="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          ${highYieldNotes.map(p => `<div class="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">${formatRichText(p)}</div>`).join("")}
        </div>
      `;
    } else if (activeCsirHubTab === "quiz") {
      if (!currentQuiz) {
        bodyHtml = `<p class="text-xs text-slate-400 italic py-4 text-center">No quiz questions configured for this module yet.</p>`;
      } else {
        bodyHtml = `
          <div class="p-3.5 rounded-2xl bg-slate-950/95 border border-amber-500/40 space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-700/60">Question ${state.currentQuizIdx + 1} of ${quizzes.length}</span>
              <div class="flex items-center space-x-1.5">
                <button type="button" id="hubPrevQuizBtn" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs text-slate-200"><i class="fa-solid fa-chevron-left"></i></button>
                <button type="button" id="hubNextQuizBtn" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs text-slate-200"><i class="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
            <div class="text-xs text-amber-100 leading-relaxed font-medium">${formatRichText(currentQuiz.prompt)}</div>
            ${Array.isArray(currentQuiz.answer_options) && currentQuiz.answer_options.length ? `
              <div class="space-y-2 pt-1">
                ${currentQuiz.answer_options.map((opt, i) => `<button type="button" data-hub-opt="${i}" class="hub-quiz-opt w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left text-xs text-slate-200 transition">${formatRichText(opt)}</button>`).join("")}
              </div>
            ` : `
              <div class="space-y-1.5 pt-1">
                <div class="text-[10px] font-mono uppercase text-slate-400">Select the matching complex/node:</div>
                ${Object.values(mod.nodes || {}).slice(0, 6).map(n => `<button type="button" data-hub-node-ans="${n.id}" class="hub-quiz-node-btn w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left text-xs text-slate-200 transition">${formatRichText(n.title.split(":")[0])}</button>`).join("")}
              </div>
            `}
            <div id="hubQuizFeedbackBox" class="hidden p-2.5 rounded-xl text-xs leading-relaxed"></div>
          </div>
        `;
      }
    } else if (activeCsirHubTab === "drawer" && node) {
      const resourcesHtml = (node.external_resources || []).map(r => `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-white/15 hover:border-emerald-400 transition"><span class="text-xs text-emerald-300 truncate pr-2">${r.title}</span><span class="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">${r.type || "3D / Ref"}</span></a>`).join("");
      bodyHtml = `
        <div class="space-y-3">
          <p class="text-xs text-slate-300 leading-relaxed">Prefer reading all 4 tabs in a single full-height side sheet?</p>
          <button type="button" id="hubOpenDrawerBtn" class="w-full py-2.5 px-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-400/50 text-xs font-bold transition flex items-center justify-center space-x-2 shadow"><i class="fa-solid fa-sliders"></i><span>Open Full-Screen Reference Drawer</span></button>
          ${resourcesHtml ? `<div class="pt-2 border-t border-white/10 space-y-2"><div class="text-[10px] font-mono uppercase text-slate-400">External 3D Structures</div>${resourcesHtml}</div>` : ""}
        </div>
      `;
    }

    inspector.innerHTML = `${hubTabsHtml}${bodyHtml}`;

    inspector.querySelectorAll("[data-csir-hub-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCsirHubTab = btn.dataset.csirHubTab;
        renderConsolidatedCsirHubCard();
        typesetMath();
      });
    });

    document.getElementById("hubPrevQuizBtn")?.addEventListener("click", () => {
      state.currentQuizIdx = (state.currentQuizIdx - 1 + quizzes.length) % quizzes.length;
      renderConsolidatedCsirHubCard();
      typesetMath();
    });
    document.getElementById("hubNextQuizBtn")?.addEventListener("click", () => {
      state.currentQuizIdx = (state.currentQuizIdx + 1) % quizzes.length;
      renderConsolidatedCsirHubCard();
      typesetMath();
    });

    const showHubQuizResult = (ok, text) => {
      const fb = document.getElementById("hubQuizFeedbackBox");
      if (!fb) return;
      fb.classList.remove("hidden");
      fb.className = `p-3 rounded-xl text-xs border ${ok ? "bg-emerald-950/90 border-emerald-400 text-emerald-100" : "bg-rose-950/90 border-rose-400 text-rose-100"}`;
      fb.innerHTML = `<strong>${ok ? "✓ Correct!" : "✗ Not quite:"}</strong> ${formatRichText(text)}`;
      typesetMath();
    };

    inspector.querySelectorAll(".hub-quiz-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen = currentQuiz.answer_options[Number(btn.dataset.hubOpt)];
        const ok = chosen === currentQuiz.correct_answer;
        showHubQuizResult(ok, ok ? currentQuiz.explanation : `Correct Answer: ${currentQuiz.correct_answer}. ${currentQuiz.explanation || ""}`);
      });
    });
    inspector.querySelectorAll(".hub-quiz-node-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const clickedId = btn.dataset.hubNodeAns;
        const ok = clickedId === currentQuiz.correct_node_id;
        showHubQuizResult(ok, ok ? (currentQuiz.feedback?.correct || currentQuiz.explanation || "Spot on!") : (currentQuiz.feedback?.incorrect || currentQuiz.explanation || "Try another complex."));
      });
    });
    document.getElementById("hubOpenDrawerBtn")?.addEventListener("click", () => toggleStudyDrawer(true));
  }

  function renderInteractiveSvgSimulator() {
    const simPanel = document.getElementById("simulatorPanel");
    if (!simPanel || !state.moduleData) return;
    simPanel.classList.remove("hidden");

    const mod = state.moduleData;
    const sim = mod.inhibitor_simulator || {};
    const agents = sim.agents || [];
    const activeAgent = agents.find(a => a.id === state.activeSimAgentId);
    const baseline = sim.baseline_metrics || {};
    const predicted = activeAgent?.predicted_phenotype || activeAgent?.resulting_metrics || {};

    const allNodes = Object.values(mod.nodes || {}).slice(0, 4);
    if (!selectedSimNodeId && allNodes.length) {
      selectedSimNodeId = activeAgent?.target_node || allNodes[0].id;
    }
    const inspectedNode = mod.nodes?.[selectedSimNodeId] || allNodes[0];
    const targetNodeId = activeAgent?.target_node;
    const blockedIdx = allNodes.findIndex(n => n.id === targetNodeId);

    const svgNodesHtml = allNodes.map((n, i) => {
      const cx = 75 + i * 145;
      const cy = 92;
      const isSelectedNode = inspectedNode && n.id === inspectedNode.id;
      const isTarget = n.id === targetNodeId || (activeAgent && blockedIdx === -1 && i === 1);
      const isDownstreamBlocked = activeAgent && ((blockedIdx !== -1 && i > blockedIdx) || (blockedIdx === -1 && i > 1));
      const shortName = (n.title || `Complex ${i + 1}`).split(":")[0].split("(")[0].trim().slice(0, 15);

      let edgeSvg = "";
      if (i < allNodes.length - 1) {
        const nextCx = 75 + (i + 1) * 145;
        const edgeBlocked = isTarget || isDownstreamBlocked;
        edgeSvg = `
          <line x1="${cx + 38}" y1="${cy}" x2="${nextCx - 38}" y2="${cy}" stroke="${edgeBlocked ? '#f43f5e' : '#34d399'}" stroke-width="3" class="${edgeBlocked ? 'svg-flux-blocked' : 'svg-flux-active'}" />
          <polygon points="${nextCx - 38},${cy} ${nextCx - 46},${cy - 5} ${nextCx - 46},${cy + 5}" fill="${edgeBlocked ? '#f43f5e' : '#34d399'}" />
        `;
      }

      return `
        ${edgeSvg}
        <g class="svg-pathway-node cursor-pointer" data-svg-node="${n.id}">
          ${isSelectedNode ? `<circle cx="${cx}" cy="${cy}" r="41" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" />` : ""}
          <circle cx="${cx}" cy="${cy}" r="34" fill="${isTarget ? 'rgba(159, 18, 57, 0.9)' : isSelectedNode ? 'rgba(3, 105, 161, 0.85)' : isDownstreamBlocked ? 'rgba(30, 41, 59, 0.75)' : 'rgba(6, 78, 59, 0.88)'}" stroke="${isTarget ? '#fb7185' : isSelectedNode ? '#38bdf8' : isDownstreamBlocked ? '#64748b' : '#34d399'}" stroke-width="${isSelectedNode || isTarget ? '3' : '2'}" />
          <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#ffffff" font-size="10" font-family="monospace" font-weight="bold">STEP ${i + 1}</text>
          <text x="${cx}" y="${cy + 11}" text-anchor="middle" fill="${isTarget ? '#fecdd3' : '#e2e8f0'}" font-size="9" font-family="sans-serif">${shortName}</text>
          ${isTarget ? `<line x1="${cx}" y1="${cy - 54}" x2="${cx}" y2="${cy - 37}" stroke="#f43f5e" stroke-width="3.5" /><line x1="${cx - 14}" y1="${cy - 37}" x2="${cx + 14}" y2="${cy - 37}" stroke="#f43f5e" stroke-width="4" /><rect x="${cx - 48}" y="${cy - 74}" width="96" height="18" rx="6" fill="#881337" stroke="#fb7185" stroke-width="1" /><text x="${cx}" y="${cy - 62}" text-anchor="middle" fill="#ffe4e6" font-size="9" font-family="monospace" font-weight="bold">⊣ ${activeAgent.name.slice(0, 12)}</text>` : ""}
        </g>
      `;
    }).join("");

    let floatingQuickTabHtml = "";
    if (inspectedNode) {
      const metricEntries = Object.entries(inspectedNode.metrics || {}).slice(0, 2);
      const conciseSummary = (inspectedNode.tabs?.mechanism?.[0] || inspectedNode.subtitle || "").slice(0, 210) + "...";
      floatingQuickTabHtml = `
        <div id="simFloatingQuickCard" class="mb-3.5 p-3.5 rounded-2xl bg-slate-950/95 border border-sky-400/50 shadow-2xl relative backdrop-blur-xl">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-sky-950 text-sky-300 border border-sky-700/60"><i class="fa-solid fa-circle-info mr-1"></i>Selected Complex / Node</span>
                ${activeAgent ? `<span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-700/60">Perturbed by ${activeAgent.name.split("(")[0].trim()}</span>` : ""}
              </div>
              <h4 class="text-xs sm:text-sm font-bold text-white leading-snug">${formatRichText(inspectedNode.title)}</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">${formatRichText(inspectedNode.subtitle || "")}</p>
            </div>
            <button type="button" id="closeSimQuickCardBtn" class="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p class="text-[11px] text-slate-200 leading-relaxed mt-2 pt-2 border-t border-white/10">${formatRichText(conciseSummary)}</p>
          ${metricEntries.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">${metricEntries.map(([k, v]) => `<div class="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10"><span class="text-[9px] font-mono uppercase text-emerald-400 block">${k.replace(/_/g, " ")}</span><span class="text-[11px] text-slate-200 font-medium">${formatRichText(String(v))}</span></div>`).join("")}</div>` : ""}
        </div>
      `;
    }

    const agentsButtonsHtml = agents.map(ag => {
      const isSelected = ag.id === state.activeSimAgentId;
      return `<button type="button" data-sim-agent="${ag.id}" class="sim-agent-pill px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center space-x-1.5 text-left ${isSelected ? "bg-rose-950/90 border-rose-400 text-rose-100 shadow-lg" : "bg-slate-950/85 border-white/15 text-slate-200 hover:border-emerald-400"}"><i class="fa-solid ${isSelected ? 'fa-ban text-rose-400' : 'fa-vial text-emerald-400'} text-[10px] shrink-0"></i><span>${ag.name}</span></button>`;
    }).join("");

    const metricsHtml = Object.keys(baseline).map(k => {
      const baseVal = baseline[k];
      const newVal = activeAgent && predicted[k] !== undefined ? predicted[k] : baseVal;
      const changed = activeAgent && String(newVal) !== String(baseVal);
      return `<div class="p-2.5 rounded-xl bg-slate-950/90 border ${changed ? 'border-rose-500/80 bg-rose-950/30' : 'border-white/15'}"><div class="text-[10px] font-mono uppercase ${changed ? 'text-rose-300 font-bold' : 'text-slate-400'}">${k.replace(/_/g, " ")}</div><div class="text-xs font-semibold ${changed ? 'text-rose-100' : 'text-emerald-300'} mt-0.5">${formatRichText(String(newVal))}</div></div>`;
    }).join("");

    simPanel.innerHTML = `
      <div id="simAccumulatorToggleBar" class="cursor-pointer select-none flex items-center justify-between gap-3 p-1">
        <div class="flex items-center space-x-2.5">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-600/25 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-2 shadow"><i class="fa-solid fa-wave-square"></i><span>Pathway Simulator</span></span>
          <span class="text-[11px] font-mono ${activeAgent ? 'text-rose-300' : 'text-slate-300'} hidden sm:inline">${activeAgent ? `● Perturbed: ${activeAgent.name.split("(")[0]}` : "● Interactive Flux & Kinetics"}</span>
        </div>
        <button type="button" class="px-3 py-1 rounded-xl bg-slate-900/90 border border-white/20 text-xs font-mono text-emerald-300 flex items-center space-x-1.5"><span>${simExpanded ? "Collapse" : "Expand Simulator"}</span><i class="fa-solid ${simExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-[10px]"></i></button>
      </div>
      ${simExpanded ? `
        <div class="mt-4 pt-3.5 border-t border-white/15">
          ${floatingQuickTabHtml}
          <div class="w-full rounded-2xl bg-slate-950/95 border border-white/20 p-2.5 mb-3.5 overflow-x-auto shadow-inner">
            <div class="flex items-center justify-between px-1 mb-1">
              <span class="text-[10px] font-mono uppercase text-emerald-400"><i class="fa-solid fa-hand-pointer mr-1"></i>Tap any circular Step/Complex below to inspect its role above</span>
              ${activeAgent ? `<button type="button" id="resetSimAgentBtn" class="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-[10px] font-mono text-rose-200"><i class="fa-solid fa-rotate-left mr-1"></i>Reset Wild-Type</button>` : ""}
            </div>
            <svg viewBox="0 0 590 155" class="w-full h-auto min-w-[460px]">
              <defs><radialGradient id="simStageGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(16, 185, 129, 0.20)" /><stop offset="100%" stop-color="rgba(2, 6, 23, 0)" /></radialGradient></defs>
              <rect width="590" height="155" fill="url(#simStageGlow)" rx="12" />
              ${svgNodesHtml}
            </svg>
          </div>
          <div class="mb-4">
            <div class="text-[10px] font-mono uppercase text-slate-300 mb-2"><i class="fa-solid fa-vial-circle-check mr-1 text-emerald-400"></i>Apply Experimental Inhibitor / Perturbation Factor:</div>
            <div class="flex flex-wrap gap-2">${agentsButtonsHtml}</div>
          </div>
          ${metricsHtml ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">${metricsHtml}</div>` : ""}
          <div class="pt-3 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div class="md:col-span-5 space-y-3">
              <div class="text-[11px] font-mono uppercase text-emerald-300 font-bold">Live SVG Enzyme Kinetics Curve</div>
              <div><label class="block text-[11px] text-slate-300 mb-1">Substrate $[S]$: <span id="subVal" class="text-emerald-400 font-mono font-bold">60</span> µM</label><input type="range" id="simSubstrate" min="5" max="200" value="60" class="aero-range-slider"></div>
              <div><label class="block text-[11px] text-slate-300 mb-1">Inhibitor $[I]$: <span id="inhVal" class="text-amber-400 font-mono font-bold">0</span> µM</label><input type="range" id="simInhibitor" min="0" max="100" value="0" class="aero-range-slider"></div>
              <div id="simCalculatedOutput" class="p-2.5 rounded-xl bg-slate-950 border border-white/15 font-mono text-[11px] text-emerald-300"></div>
            </div>
            <div class="md:col-span-7 rounded-2xl bg-slate-950/95 border border-white/15 p-2"><svg id="kineticsCurveSvg" viewBox="0 0 320 150" class="w-full h-auto"></svg></div>
          </div>
        </div>
      ` : ""}
    `;

    document.getElementById("simAccumulatorToggleBar")?.addEventListener("click", () => {
      simExpanded = !simExpanded;
      renderInteractiveSvgSimulator();
      typesetMath();
    });
    document.getElementById("closeSimQuickCardBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = document.getElementById("simFloatingQuickCard");
      if (card) card.style.display = "none";
    });
    simPanel.querySelectorAll(".svg-pathway-node").forEach(g => {
      g.addEventListener("click", () => {
        selectedSimNodeId = g.dataset.svgNode;
        renderInteractiveSvgSimulator();
        typesetMath();
      });
    });
    simPanel.querySelectorAll(".sim-agent-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        state.activeSimAgentId = btn.dataset.simAgent;
        const chosen = agents.find(a => a.id === state.activeSimAgentId);
        if (chosen?.target_node && mod.nodes?.[chosen.target_node]) {
          selectedSimNodeId = chosen.target_node;
        }
        renderInteractiveSvgSimulator();
        typesetMath();
      });
    });
    document.getElementById("resetSimAgentBtn")?.addEventListener("click", () => {
      state.activeSimAgentId = null;
      renderInteractiveSvgSimulator();
      typesetMath();
    });

    if (simExpanded) {
      const subSlider = document.getElementById("simSubstrate");
      const inhSlider = document.getElementById("simInhibitor");
      const subVal = document.getElementById("subVal");
      const inhVal = document.getElementById("inhVal");
      const outBox = document.getElementById("simCalculatedOutput");
      const curveSvg = document.getElementById("kineticsCurveSvg");

      const drawSvgKinetics = () => {
        const S = Number(subSlider?.value || 60);
        const I = Number(inhSlider?.value || 0);
        if (subVal) subVal.textContent = S;
        if (inhVal) inhVal.textContent = I;
        const Vmax = 100, Km = 25, Ki = 20;
        const appKm = Km * (1 + I / Ki);
        const v0 = (Vmax * S) / (appKm + S);
        if (outBox) outBox.innerHTML = `V₀ = <strong>${v0.toFixed(1)}</strong> µmol/min | Km(app) = <strong>${appKm.toFixed(1)}</strong> µM`;
        if (!curveSvg) return;
        const plotX = s => 35 + (s / 200) * 265;
        const plotY = v => 128 - (v / 100) * 105;
        let uninhibitedPts = [], currentPts = [];
        for (let s = 0; s <= 200; s += 8) {
          uninhibitedPts.push(`${plotX(s).toFixed(1)},${plotY((Vmax * s) / (Km + s)).toFixed(1)}`);
          currentPts.push(`${plotX(s).toFixed(1)},${plotY((Vmax * s) / (appKm + s)).toFixed(1)}`);
        }
        const curX = plotX(S), curY = plotY(v0);
        curveSvg.innerHTML = `
          <line x1="35" y1="18" x2="35" y2="128" stroke="#475569" stroke-width="1.5" />
          <line x1="35" y1="128" x2="305" y2="128" stroke="#475569" stroke-width="1.5" />
          <line x1="35" y1="${plotY(100)}" x2="305" y2="${plotY(100)}" stroke="#334155" stroke-dasharray="3 3" />
          <text x="40" y="${plotY(100) + 10}" fill="#64748b" font-size="8" font-family="monospace">Vmax (100)</text>
          <polyline fill="none" stroke="rgba(16, 185, 129, 0.35)" stroke-width="2" stroke-dasharray="4 3" points="${uninhibitedPts.join(" ")}" />
          <polyline fill="none" stroke="${I > 0 ? '#f59e0b' : '#10b981'}" stroke-width="2.5" points="${currentPts.join(" ")}" />
          <line x1="${curX}" y1="128" x2="${curX}" y2="${curY}" stroke="#38bdf8" stroke-dasharray="2 2" />
          <line x1="35" y1="${curY}" x2="${curX}" y2="${curY}" stroke="#38bdf8" stroke-dasharray="2 2" />
          <circle cx="${curX}" cy="${curY}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
          <text x="170" y="144" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">Substrate [S] (µM)</text>
          <text x="12" y="75" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace" transform="rotate(-90 12 75)">Velocity V₀</text>
        `;
      };
      subSlider?.addEventListener("input", drawSvgKinetics);
      inhSlider?.addEventListener("input", drawSvgKinetics);
      drawSvgKinetics();
    }
  }

  // CORE HOOKS: Intercept BOTH renderCircularZoomAndExpandableCards AND renderNodeInspectorAndDrawer
  function installCoreRenderHooks() {
    const origStageRender = window.renderCircularZoomAndExpandableCards;
    if (typeof origStageRender === "function") {
      window.renderCircularZoomAndExpandableCards = function () {
        origStageRender();
        cleanUpStageHudAndButtons();
        renderPureMetricSliderAndCleanStage();
        renderBiologicalRegionSvgViewport();
      };
    }

    const origInspectorRender = window.renderNodeInspectorAndDrawer;
    if (typeof origInspectorRender === "function") {
      window.renderNodeInspectorAndDrawer = function () {
        origInspectorRender();
        renderConsolidatedCsirHubCard();
      };
    }

    const origSimRender = window.renderPathwaySimulator;
    if (typeof origSimRender === "function") {
      window.renderPathwaySimulator = function () {
        renderInteractiveSvgSimulator();
      };
    }

    // Run once immediately for initial state
    if (state.moduleData) {
      window.renderCircularZoomAndExpandableCards();
      window.renderNodeInspectorAndDrawer();
      window.renderPathwaySimulator();
    }
  }
})(); 