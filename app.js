/**
 * ============================================================================
 * CELLULUM — Universal Schema v1.0 & v1.1 Multi-Scale Engine (app.js)
 * Built for CSIR NET Life Sciences JSON Modules (module1 to module15)
 * ============================================================================
 */

const APP_CONFIG = {
  name: "Cellulum",
  pubmedToolName: "CellulumExplorer",
  pubmedContactEmail: "cellulum.science@example.com",
  searchPaths: ["./", "./data/", "./modules/"] // Automatically checks root, /data, and /modules
};

// Master Registry supporting v1.0 (module1.json), v1.1 (*_revised.json), and descriptive filenames
const MODULE_REGISTRY = [
  {
    id: "module_01",
    shortUnit: "Mod 01",
    title: "Mitochondrial Bioenergetics & OxPhos",
    files: ["module1.json", "module_01_bioenergetics_revised.json", "module_01_bioenergetics.json", "module_01_biochemistry_revised.json", "module_01.json"]
  },
  {
    id: "module_02",
    shortUnit: "Mod 02",
    title: "Metabolic Pathways & Enzyme Kinetics",
    files: ["module2.json", "module_02_metabolism_revised.json", "module_02_bioenergetics_revised.json", "module_02_biochemistry.json", "module_02.json"]
  },
  {
    id: "module_03",
    shortUnit: "Mod 03",
    title: "Membrane Structure & Ion Channels",
    files: ["module3.json", "module_03_membranes_revised.json", "module_03_cellular_membranes.json", "module_03.json"]
  },
  {
    id: "module_04",
    shortUnit: "Mod 04",
    title: "Organelle Trafficking & Cytoskeleton",
    files: ["module4.json", "module_04_organelles_revised.json", "module_04_vesicular_traffic.json", "module_04.json"]
  },
  {
    id: "module_05",
    shortUnit: "Mod 05",
    title: "DNA Replication, Repair & Recombination",
    files: ["module5.json", "module_05_dna_replication_revised.json", "module_05_molecular_biology.json", "module_05.json"]
  },
  {
    id: "module_06",
    shortUnit: "Mod 06",
    title: "Transcription, Splicing & RNA Regulation",
    files: ["module6.json", "module_06_transcription_revised.json", "module_06_rna_processing.json", "module_06.json"]
  },
  {
    id: "module_07",
    shortUnit: "Mod 07",
    title: "Cell Signaling & Immunology",
    files: ["module7.json", "module_07_cell_signaling_revised.json", "module_07_signaling_immunology.json", "module_07.json"]
  },
  {
    id: "module_08",
    shortUnit: "Mod 08",
    title: "Developmental Biology & Morphogenesis",
    files: ["module_08_developmental_bio_revised.json", "module8.json", "module_08_developmental_bio.json", "module_08.json"]
  },
  {
    id: "module_09",
    shortUnit: "Mod 09",
    title: "Plant Physiology & Phytohormones",
    files: ["module9.json", "module_09_plant_physiology_revised.json", "module_09_plant_biology.json", "module_09.json"]
  },
  {
    id: "module_10",
    shortUnit: "Mod 10",
    title: "Animal Physiology & Neurobiology",
    files: ["module10.json", "module_10_animal_physiology_revised.json", "module_10_physiology.json", "module_10.json"]
  },
  {
    id: "module_11",
    shortUnit: "Mod 11",
    title: "Classical & Molecular Genetics",
    files: ["module11.json", "module_11_inheritance_genetics_revised.json", "module_11_genetics_revised.json", "module_11.json"]
  },
  {
    id: "module_12",
    shortUnit: "Mod 12",
    title: "Diversity of Life & Taxonomy",
    files: ["module12.json", "module_12_diversity_of_life_revised.json", "module_12_diversity.json", "module_12.json"]
  },
  {
    id: "module_13",
    shortUnit: "Mod 13",
    title: "Ecological Principles & Biogeography",
    files: ["module13.json", "module_13_ecology_revised.json", "module_13_ecological_principles.json", "module_13.json"]
  },
  {
    id: "module_14",
    shortUnit: "Mod 14",
    title: "Wetlab Biophysics & Molecular Methods",
    files: ["module14.json", "module_14_wetlab_biophysics_revised.json", "module_14_wetlab_biophysics.json", "module_14_evolution_revised.json", "module_14.json"]
  },
  {
    id: "module_15",
    shortUnit: "Mod 15",
    title: "Evolutionary Biology & Statistical Methods",
    files: ["module15.json", "module_15_methods_in_biology_revised.json", "module_15_biophysical_methods.json", "module_15.json"]
  }
];

// Global Application State
const state = {
  activeRegistryItem: MODULE_REGISTRY[0],
  moduleData: null,
  activeLevelId: "L1",
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
  renderSidebarRegistry(MODULE_REGISTRY);
  bindUIEvents();
  // Load Module 01 by default
  loadModule(MODULE_REGISTRY[0].id);
});

// ============================================================================
// SMART MULTI-PATH JSON LOADER (FILTERS OUT CORRUPTED DOCX BINARIES)
// ============================================================================
async function loadModule(registryId) {
  const regItem = MODULE_REGISTRY.find(m => m.id === registryId) || MODULE_REGISTRY[0];
  state.activeRegistryItem = regItem;
  state.activeSimAgentId = null;
  state.currentQuizIdx = 0;

  // Highlight active sidebar item
  document.querySelectorAll(".mod-nav-btn").forEach(btn => {
    const isCurrent = btn.dataset.id === regItem.id;
    btn.classList.toggle("border-teal-500", isCurrent);
    btn.classList.toggle("bg-teal-950/30", isCurrent);
  });

  if (state.cache[regItem.id]) {
    state.moduleData = state.cache[regItem.id];
  } else {
    state.moduleData = await fetchModuleJsonWithFallback(regItem);
    state.cache[regItem.id] = state.moduleData;
  }

  // Apply dynamic module theme colors (--theme-color and --accent-glow)
  const root = document.documentElement;
  root.style.setProperty("--theme-color", state.moduleData.theme_color || "#14b8a6");
  root.style.setProperty("--accent-glow", state.moduleData.accent_glow || "rgba(20, 184, 166, 0.45)");

  // Default to first scale level & its first node (supports both node_ids and hotspots)
  const firstLevel = state.moduleData.scale_levels?.[0];
  state.activeLevelId = firstLevel ? firstLevel.level_id : "L1";
  const firstLevelNodes = firstLevel?.node_ids || firstLevel?.hotspots || [];
  state.activeNodeId = firstLevelNodes[0] || Object.keys(state.moduleData.nodes || {})[0];

  renderModuleWorkspace();
}

async function fetchModuleJsonWithFallback(regItem) {
  for (const dir of APP_CONFIG.searchPaths) {
    for (const fileName of regItem.files) {
      try {
        const res = await fetch(`${dir}${fileName}`);
        if (res.ok) {
          const text = await res.text();
          // Guard against .docx binary files accidentally renamed as .json
          if (text.trim().startsWith("{")) {
            return JSON.parse(text);
          } else {
            console.warn(`Skipped ${fileName}: File is not plain-text JSON (likely a renamed .docx file).`);
          }
        }
      } catch (e) {
        // Continue trying next candidate filename/path
      }
    }
  }
  return getEmbeddedFallback(regItem);
}

// ============================================================================
// WORKSPACE RENDERER (SCALE LEVELS, 2D SPATIAL CANVAS, SIMULATOR, INSPECTOR)
// ============================================================================
function renderModuleWorkspace() {
  const mod = state.moduleData;

  // Detect schema version (v1.1 if schema_version exists, otherwise v1.0)
  const detectedVersion = mod.schema_version ? `Schema v${mod.schema_version}` : "Schema v1.0";
  document.getElementById("schemaBadge").textContent = detectedVersion;
  document.getElementById("moduleTitle").textContent = mod.title;
  document.getElementById("moduleSubtitle").textContent = mod.subtitle || "";

  // CSIR NET Unit Badges
  const unitsBox = document.getElementById("csirUnitsContainer");
  unitsBox.innerHTML = (mod.csir_net_units || []).map(u => `
    <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-700">${u}</span>
  `).join("");

  // Quiz Count Badge
  const quizzes = mod.quiz_challenges || [];
  document.getElementById("quizCountBadge").textContent = quizzes.length;

  renderScaleLevelsBar();
  renderSpatialStage();
  renderSimulatorPanel();
  renderNodeInspector();
  if (state.quizMode) renderActiveQuizQuestion();
}

// 1. Scale Levels Bar (L1 - L4)
function renderScaleLevelsBar() {
  const bar = document.getElementById("scaleLevelsBar");
  const levels = state.moduleData.scale_levels || [];

  bar.innerHTML = levels.map(lvl => {
    const active = lvl.level_id === state.activeLevelId;
    return `
      <button data-level="${lvl.level_id}" class="level-tab-btn ${active ? 'active' : ''}">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold ${active ? 'text-white' : 'text-slate-400'}">${lvl.level_id}</span>
          <span class="text-[10px] font-mono text-teal-400 truncate max-w-[90px]">${lvl.scale_metric || ''}</span>
        </div>
        <div class="text-[11px] text-slate-300 font-medium truncate mt-0.5" title="${lvl.name}">${lvl.name}</div>
      </button>
    `;
  }).join("");

  bar.querySelectorAll(".level-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeLevelId = btn.dataset.level;
      const lvlObj = levels.find(l => l.level_id === state.activeLevelId);
      const lvlNodes = lvlObj?.node_ids || lvlObj?.hotspots || [];
      if (lvlNodes.length) {
        state.activeNodeId = lvlNodes[0];
      }
      renderScaleLevelsBar();
      renderSpatialStage();
      renderNodeInspector();
    });
  });
}

// 2. Spatial 2D Canvas & Conceptual Navigation Graph (Supports v1.0 & v1.1)
function renderSpatialStage() {
  const mod = state.moduleData;
  const lvl = (mod.scale_levels || []).find(l => l.level_id === state.activeLevelId) || mod.scale_levels?.[0];
  if (!lvl) return;

  document.getElementById("activeLevelName").textContent = `${lvl.level_id}: ${lvl.name}`;
  document.getElementById("activeLevelMetric").textContent = lvl.scale_metric || "";
  document.getElementById("activeLevelDescription").textContent = lvl.description || "";
  document.getElementById("activeLevelNavNote").textContent =
    lvl.navigation_note || `Camera Zoom Factor: ${lvl.camera_zoom_factor || 1.0}x • Click any hotspot node to inspect mechanisms and CSIR NET traps.`;

  const nodesLayer = document.getElementById("spatialNodesLayer");
  const svgLayer = document.getElementById("navGraphSvg");
  nodesLayer.innerHTML = "";
  svgLayer.innerHTML = "";

  // Dual v1.0 / v1.1 node list resolution
  const levelNodeIds = lvl.node_ids || lvl.hotspots || [];
  const activeAgent = (mod.inhibitor_simulator?.agents || []).find(a => a.id === state.activeSimAgentId);

  // Draw conceptual edges (either from v1.1 navigation_graph.edges or sequential v1.0 order)
  const explicitEdges = mod.navigation_graph?.edges || [];
  const edgesToDraw = [];

  if (explicitEdges.length > 0) {
    explicitEdges.forEach(edge => {
      if (levelNodeIds.includes(edge.from) && levelNodeIds.includes(edge.to)) {
        edgesToDraw.push(edge);
      }
    });
  } else if (levelNodeIds.length > 1) {
    // Automatic sequential pathway connectors for v1.0 modules (e.g., Complex I -> II -> III -> IV)
    for (let i = 0; i < levelNodeIds.length - 1; i++) {
      edgesToDraw.push({ from: levelNodeIds[i], to: levelNodeIds[i + 1] });
    }
  }

  edgesToDraw.forEach(edge => {
    const nodeA = mod.nodes?.[edge.from];
    const nodeB = mod.nodes?.[edge.to];
    const n1 = nodeA?.ui_coordinates || nodeA?.coordinates || { x: 25, y: 50 };
    const n2 = nodeB?.ui_coordinates || nodeB?.coordinates || { x: 75, y: 50 };

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${n1.x}%`);
    line.setAttribute("y1", `${n1.y}%`);
    line.setAttribute("x2", `${n2.x}%`);
    line.setAttribute("y2", `${n2.y}%`);
    line.setAttribute("stroke", mod.theme_color || "#14b8a6");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-dasharray", "6,6");
    line.setAttribute("opacity", "0.55");
    svgLayer.appendChild(line);
  });

  // Render Spatial Node Pins using either ui_coordinates (v1.1) or coordinates (v1.0)
  levelNodeIds.forEach((nodeId, idx) => {
    const node = mod.nodes?.[nodeId];
    if (!node) return;

    const fallbackX = Math.round(((idx + 1) / (levelNodeIds.length + 1)) * 100);
    const coords = node.ui_coordinates || node.coordinates || { x: fallbackX, y: 50 };
    const isSelected = node.id === state.activeNodeId;
    const isSimTarget = activeAgent && activeAgent.target_node === node.id;

    const pin = document.createElement("div");
    pin.className = `spatial-node-pin ${isSelected ? "active-pin" : ""} ${isSimTarget ? "sim-targeted" : ""}`;
    pin.style.left = `${coords.x}%`;
    pin.style.top = `${coords.y}%`;

    const zoomJumpHtml = node.next_zoom_target
      ? `<button data-zoom="${node.next_zoom_target}" class="next-zoom-btn mt-1.5 w-full py-1 px-2 rounded bg-teal-950/90 hover:bg-teal-900 text-teal-300 border border-teal-700/60 text-[10px] font-mono flex items-center justify-center space-x-1 transition">
           <i class="fa-solid fa-magnifying-glass-plus"></i>
           <span>Zoom to ${node.next_zoom_target}</span>
         </button>`
      : "";

    pin.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-teal-400 border border-slate-800">${node.level} Hotspot</span>
        ${isSimTarget
          ? '<span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700">Perturbed</span>'
          : `<span class="w-2 h-2 rounded-full ${isSelected ? 'bg-teal-400' : 'bg-slate-600'}"></span>`
        }
      </div>
      <div class="text-xs font-bold text-white leading-snug line-clamp-2">${node.title}</div>
      <div class="text-[10px] text-slate-400 mt-1 line-clamp-1">${node.subtitle || ""}</div>
      ${zoomJumpHtml}
    `;

    pin.addEventListener("click", (e) => {
      // Handle click on "Zoom to L2" button if present
      const zoomBtn = e.target.closest(".next-zoom-btn");
      if (zoomBtn) {
        e.stopPropagation();
        const targetLvl = zoomBtn.dataset.zoom;
        const lvlObj = (mod.scale_levels || []).find(l => l.level_id === targetLvl);
        if (lvlObj) {
          state.activeLevelId = targetLvl;
          const nextNodes = lvlObj.node_ids || lvlObj.hotspots || [];
          if (nextNodes.length) state.activeNodeId = nextNodes[0];
          renderScaleLevelsBar();
          renderSpatialStage();
          renderNodeInspector();
        }
        return;
      }

      state.activeNodeId = node.id;
      renderSpatialStage();
      renderNodeInspector();

      if (state.quizMode) {
        handleQuizNodeClick(node.id);
      }
    });

    nodesLayer.appendChild(pin);
  });

  typesetMath();
}

// 3. Right-Hand Node Inspector & Drawer Synchronizer
function renderNodeInspector() {
  const mod = state.moduleData;
  const node = mod.nodes?.[state.activeNodeId];
  if (!node) return;

  document.getElementById("inspectorNodeLevel").textContent = `${node.level} Node`;
  document.getElementById("inspectorNodeTitle").textContent = node.title;
  document.getElementById("inspectorNodeSubtitle").textContent = node.subtitle || "";

  // Render node.metrics key-value dictionary
  const metricsBox = document.getElementById("inspectorMetricsList");
  const metricsEntries = Object.entries(node.metrics || {});
  metricsBox.innerHTML = metricsEntries.map(([k, v]) => `
    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
      <div class="text-[10px] font-mono uppercase text-teal-400 font-bold">${k.replace(/_/g, " ")}</div>
      <div class="text-xs text-slate-200 mt-0.5 leading-snug">${formatMarkdownBold(String(v))}</div>
    </div>
  `).join("");

  // Render node.external_resources (PDB 3D models, OMIM & Nobel Lectures)
  const resBox = document.getElementById("inspectorResourcesList");
  const resources = node.external_resources || [];
  resBox.innerHTML = resources.length
    ? `<div class="text-[10px] font-mono uppercase text-slate-400 mb-1">3D Structures & Primary Literature</div>` + resources.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition group">
          <div class="text-[11px] font-medium text-slate-200 group-hover:text-teal-300 line-clamp-1">${r.title}</div>
          <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 ml-2 shrink-0">${r.type || "Link"}</span>
        </a>
      `).join("")
    : "";

  renderDrawerContent(node);
  fetchPubMedForNode(node.title);
  typesetMath();
}

// 4. Slide-Out 4-Tab Study Drawer Content
function renderDrawerContent(node) {
  document.getElementById("drawerNodeLevel").textContent = `${node.level} • ${node.id}`;
  document.getElementById("drawerNodeTitle").textContent = node.title;
  document.getElementById("drawerNodeSubtitle").textContent = node.subtitle || "";

  const tabData = node.tabs?.[state.activeDrawerTab] || [];
  const body = document.getElementById("drawerTabContent");

  body.innerHTML = tabData.map(paragraph => `
    <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 leading-relaxed text-xs sm:text-sm text-slate-200">
      ${formatMarkdownBold(paragraph)}
    </div>
  `).join("");

  typesetMath();
}

// 5. Inhibitor & Perturbation Simulator Engine (Supports both v1.0 & v1.1 keys)
function renderSimulatorPanel() {
  const sim = state.moduleData.inhibitor_simulator;
  if (!sim) return;

  const agentsList = document.getElementById("simAgentsList");
  const metricsGrid = document.getElementById("simMetricsGrid");
  const mechBox = document.getElementById("simMechanismBox");
  const simBadge = document.getElementById("activeSimulatorBadge");

  const activeAgent = (sim.agents || []).find(a => a.id === state.activeSimAgentId);

  // Render Agent Selector Pills
  agentsList.innerHTML = (sim.agents || []).map(agent => {
    const isCurrent = agent.id === state.activeSimAgentId;
    return `
      <button data-agent="${agent.id}" class="sim-agent-btn px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${isCurrent ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg' : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'}">
        <i class="fa-solid fa-syringe text-[10px] ${isCurrent ? 'text-rose-400' : 'text-teal-400'}"></i>
        <span>${agent.name}</span>
      </button>
    `;
  }).join("");

  agentsList.querySelectorAll(".sim-agent-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeSimAgentId = btn.dataset.agent;
      const chosen = sim.agents.find(a => a.id === state.activeSimAgentId);
      // Automatically jump to the target node's scale level so the student sees the perturbation
      if (chosen?.target_node && state.moduleData.nodes?.[chosen.target_node]) {
        const targetNode = state.moduleData.nodes[chosen.target_node];
        state.activeLevelId = targetNode.level;
        state.activeNodeId = targetNode.id;
      }
      renderModuleWorkspace();
    });
  });

  // Dual v1.1 (predicted_phenotype) & v1.0 (resulting_metrics) support
  const baseline = sim.baseline_metrics || {};
  const predicted = activeAgent?.predicted_phenotype || activeAgent?.resulting_metrics || {};

  metricsGrid.innerHTML = Object.keys(baseline).map(metricKey => {
    const baseVal = baseline[metricKey];
    const hasOverride = activeAgent && predicted[metricKey] !== undefined;
    const predVal = hasOverride ? predicted[metricKey] : baseVal;
    const isChanged = activeAgent && String(predVal) !== String(baseVal) && String(predVal) !== "Normal";

    return `
      <div class="p-3 rounded-xl bg-slate-950/80 border ${isChanged ? 'border-rose-500/60 bg-rose-950/15' : 'border-slate-800/80'}">
        <div class="text-[10px] font-mono uppercase ${isChanged ? 'text-rose-400 font-bold' : 'text-slate-400'}">${metricKey.replace(/_/g, " ")}</div>
        <div class="text-xs font-semibold ${isChanged ? 'text-rose-200' : 'text-slate-200'} mt-1">${formatMarkdownBold(String(predVal))}</div>
      </div>
    `;
  }).join("");

  // Show/Hide Mechanism Steps (v1.1) or Binding Site (v1.0) & Rescue Experiment Box
  if (activeAgent) {
    simBadge.classList.remove("hidden");
    document.getElementById("activeSimAgentName").textContent = `${activeAgent.name}`;
    mechBox.classList.remove("hidden");
    document.getElementById("simCategoryLabel").textContent = `${activeAgent.category || "Perturbation"} — Target: ${activeAgent.target_node || "Pathway"}`;

    let stepsHtml = "";
    if (Array.isArray(activeAgent.mechanism_steps) && activeAgent.mechanism_steps.length > 0) {
      stepsHtml = activeAgent.mechanism_steps.map(s => `<li>${formatMarkdownBold(s.event)}</li>`).join("");
    } else if (activeAgent.binding_site) {
      stepsHtml = `<li><strong>Binding / Action Site:</strong> ${formatMarkdownBold(activeAgent.binding_site)}</li>`;
    } else if (activeAgent.mechanism_of_action) {
      stepsHtml = `<li>${formatMarkdownBold(activeAgent.mechanism_of_action)}</li>`;
    }

    document.getElementById("simStepsList").innerHTML = stepsHtml;
    document.getElementById("simRescueText").innerHTML = activeAgent.rescue_experiment
      ? `<strong>CSIR NET Experimental Rescue & Diagnostic Interpretation:</strong> ${formatMarkdownBold(activeAgent.rescue_experiment)}`
      : "";
  } else {
    simBadge.classList.add("hidden");
    mechBox.classList.add("hidden");
  }

  typesetMath();
}

// ============================================================================
// QUIZ CHALLENGES ENGINE (SUPPORTS V1.0 & V1.1 NODE CLICKS + MCQs)
// ============================================================================
function renderActiveQuizQuestion() {
  const quizzes = state.moduleData.quiz_challenges || [];
  if (!quizzes.length) return;

  const q = quizzes[state.currentQuizIdx];
  const qType = q.question_type || (q.correct_node_id ? "node_identification" : "multiple_choice");

  document.getElementById("quizTypeBadge").textContent = qType.replace(/_/g, " ");
  document.getElementById("quizDifficultyBadge").textContent = q.difficulty || "CSIR High-Yield";
  document.getElementById("quizProgressText").textContent = `Question ${state.currentQuizIdx + 1} of ${quizzes.length}`;
  document.getElementById("quizPromptText").innerHTML = formatMarkdownBold(q.prompt);

  const mcqBox = document.getElementById("quizMcqOptions");
  const feedbackBox = document.getElementById("quizFeedbackBox");
  feedbackBox.classList.add("hidden");

  if (Array.isArray(q.answer_options) && q.answer_options.length > 0) {
    mcqBox.classList.remove("hidden");
    mcqBox.innerHTML = q.answer_options.map(opt => `
      <button class="quiz-opt-btn p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 transition">
        ${formatMarkdownBold(opt)}
      </button>
    `).join("");

    mcqBox.querySelectorAll(".quiz-opt-btn").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const chosenRaw = q.answer_options[idx];
        const isCorrect = chosenRaw === q.correct_answer;
        showQuizFeedback(isCorrect, isCorrect ? q.explanation : `Expected: ${q.correct_answer}. ${q.explanation}`);
      });
    });
  } else {
    mcqBox.classList.add("hidden");
    // For node_identification questions, automatically switch to the scale level containing the target node
    const targetNode = state.moduleData.nodes?.[q.correct_node_id];
    if (targetNode && targetNode.level !== state.activeLevelId) {
      state.activeLevelId = targetNode.level;
      renderScaleLevelsBar();
      renderSpatialStage();
    }
  }

  typesetMath();
}

function handleQuizNodeClick(clickedNodeId) {
  const quizzes = state.moduleData.quiz_challenges || [];
  const q = quizzes[state.currentQuizIdx];
  if (!q || !q.correct_node_id) return;

  const isCorrect = clickedNodeId === q.correct_node_id;
  const msg = isCorrect
    ? (q.feedback?.correct || q.explanation)
    : (q.feedback?.incorrect || "That is a different node—check the prompt clues and click the matching hotspot on the canvas!");
  showQuizFeedback(isCorrect, msg);
}

function showQuizFeedback(isCorrect, message) {
  const box = document.getElementById("quizFeedbackBox");
  box.classList.remove("hidden", "bg-emerald-950/90", "border-emerald-500", "text-emerald-200", "bg-rose-950/90", "border-rose-500", "text-rose-200");
  box.classList.add(
    "border",
    isCorrect ? "bg-emerald-950/90" : "bg-rose-950/90",
    isCorrect ? "border-emerald-500" : "border-rose-500",
    isCorrect ? "text-emerald-200" : "text-rose-200"
  );
  box.innerHTML = `<strong>${isCorrect ? "✓ Correct!" : "✗ Try Again:"}</strong> ${formatMarkdownBold(message)}`;
  typesetMath();
}

// ============================================================================
// SIDEBAR NAVIGATION & LIVE PUBMED API
// ============================================================================
function renderSidebarRegistry(list) {
  const container = document.getElementById("moduleNavList");
  container.innerHTML = list.map(item => `
    <div data-id="${item.id}" class="mod-nav-btn p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer transition">
      <div class="flex items-center justify-between mb-0.5">
        <span class="text-[10px] font-mono font-bold uppercase text-teal-400">${item.shortUnit}</span>
        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
      </div>
      <div class="text-xs font-semibold text-slate-200 leading-snug">${item.title}</div>
    </div>
  `).join("");

  container.querySelectorAll(".mod-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => loadModule(btn.dataset.id));
  });
}

async function fetchPubMedForNode(queryTitle) {
  const box = document.getElementById("pubmedContainer");
  box.innerHTML = `<div class="text-xs text-slate-500 animate-pulse py-3"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Querying NCBI PubMed...</div>`;

  try {
    const cleanQuery = queryTitle.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 5).join(" ");
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanQuery)}&retmode=json&retmax=3&sort=relevance`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    const ids = data.esearchresult?.idlist || [];

    if (!ids.length) {
      box.innerHTML = `<p class="text-xs text-slate-500 italic">No direct PubMed matches found for this specific node query.</p>`;
      return;
    }

    const sumRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`);
    const sumData = await sumRes.json();

    box.innerHTML = ids.map(pmid => {
      const doc = sumData.result?.[pmid];
      if (!doc) return "";
      return `
        <a href="https://pubmed.ncbi.nlm.nih.gov/${pmid}/" target="_blank" rel="noopener noreferrer" class="block p-3 rounded-xl bg-slate-950/75 border border-slate-800 hover:border-sky-500/50 transition group">
          <div class="text-xs font-semibold text-slate-200 group-hover:text-sky-400 line-clamp-2 leading-snug">${doc.title}</div>
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span class="truncate max-w-[140px]">${doc.source || "Journal"}</span>
            <span>PMID: ${pmid}</span>
          </div>
        </a>
      `;
    }).join("");
  } catch (e) {
    box.innerHTML = `<p class="text-xs text-slate-500 italic">PubMed feed offline. Local PDB & literature links remain active above.</p>`;
  }
}

// ============================================================================
// UI EVENT LISTENERS & FORMATTING HELPERS
// ============================================================================
function bindUIEvents() {
  // Global Search Filter (searches module titles and loaded node titles)
  document.getElementById("globalModuleSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = MODULE_REGISTRY.filter(m =>
      m.title.toLowerCase().includes(q) || m.shortUnit.toLowerCase().includes(q)
    );
    renderSidebarRegistry(filtered);
  });

  // Reset Inhibitor Simulator to Wild-Type Baseline
  document.getElementById("resetSimBtn")?.addEventListener("click", () => {
    state.activeSimAgentId = null;
    renderModuleWorkspace();
  });

  // Slide-Out Study Drawer Controls
  const drawer = document.getElementById("studyDrawer");
  const backdrop = document.getElementById("studyDrawerBackdrop");
  const setDrawer = (open) => {
    drawer.classList.toggle("translate-x-full", !open);
    backdrop.classList.toggle("hidden", !open);
    setTimeout(() => backdrop.classList.toggle("opacity-0", !open), 15);
  };

  document.getElementById("openStudyDrawerBtn")?.addEventListener("click", () => setDrawer(true));
  document.getElementById("expandNodeDrawerBtn")?.addEventListener("click", () => setDrawer(true));
  document.getElementById("closeDrawerBtn")?.addEventListener("click", () => setDrawer(false));
  backdrop?.addEventListener("click", () => setDrawer(false));

  // Drawer 4-Tab Switching (mechanism, csir_high_yield, lab_workbench, pathology)
  document.querySelectorAll(".drawer-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".drawer-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeDrawerTab = btn.dataset.tab;
      const node = state.moduleData?.nodes?.[state.activeNodeId];
      if (node) renderDrawerContent(node);
    });
  });

  // Quiz Challenge Banner Controls
  const quizBanner = document.getElementById("quizBanner");
  document.getElementById("toggleQuizModeBtn")?.addEventListener("click", () => {
    state.quizMode = !state.quizMode;
    quizBanner.classList.toggle("hidden", !state.quizMode);
    if (state.quizMode) renderActiveQuizQuestion();
  });

  document.getElementById("closeQuizBtn")?.addEventListener("click", () => {
    state.quizMode = false;
    quizBanner.classList.add("hidden");
  });

  document.getElementById("nextQuizBtn")?.addEventListener("click", () => {
    const total = state.moduleData?.quiz_challenges?.length || 1;
    state.currentQuizIdx = (state.currentQuizIdx + 1) % total;
    renderActiveQuizQuestion();
  });

  document.getElementById("prevQuizBtn")?.addEventListener("click", () => {
    const total = state.moduleData?.quiz_challenges?.length || 1;
    state.currentQuizIdx = (state.currentQuizIdx - 1 + total) % total;
    renderActiveQuizQuestion();
  });
}

function formatMarkdownBold(str) {
  if (!str) return "";
  return str
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="italic text-teal-300">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/\n/g, "<br>");
}

function typesetMath() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(() => {});
  }
}

// Built-in fallback if a JSON file hasn't been copied into the folder yet
function getEmbeddedFallback(regItem) {
  return {
    "module_id": regItem.id,
    "title": regItem.title,
    "subtitle": `Place ${regItem.files[0]} in your project folder to load full multi-scale nodes.`,
    "csir_net_units": ["CSIR NET Life Sciences"],
    "theme_color": "#f97316",
    "accent_glow": "rgba(249, 115, 22, 0.45)",
    "scale_levels": [
      {
        "level_id": "L1",
        "name": "Architecture & Compartmentalization",
        "scale_metric": "500 nm",
        "description": `Awaiting plain-text JSON file (${regItem.files[0]}) in root or /data directory.`,
        "hotspots": ["node_placeholder_1"]
      }
    ],
    "nodes": {
      "node_placeholder_1": {
        "id": "node_placeholder_1",
        "level": "L1",
        "title": `${regItem.title} — Ready for JSON File`,
        "subtitle": `Ensure ${regItem.files[0]} is saved as plain-text UTF-8 JSON (not a renamed .docx file).`,
        "coordinates": { "x": 50, "y": 50 },
        "metrics": {
          "expected_filenames": regItem.files.join(" OR "),
          "status": "Waiting for plain-text JSON file in ./ or ./data/"
        },
        "tabs": {
          "mechanism": ["Copy your plain-text JSON file into the project folder to populate all 4 study tabs."],
          "csir_high_yield": ["High-yield CSIR NET Part C analytical notes will render here automatically."],
          "pathology": ["Clinical and genetic pathology correlations will render here."],
          "lab_workbench": ["Experimental assays and respirometry/fluorometric protocols will render here."]
        },
        "external_resources": []
      }
    },
    "inhibitor_simulator": {
      "baseline_metrics": { "status": "Ready for JSON Simulator Data" },
      "agents": []
    },
    "quiz_challenges": []
  };
}
