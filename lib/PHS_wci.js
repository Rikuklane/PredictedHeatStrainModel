// Copyright 2014 Bo Johansson. All rights reserved
// Mail: bo(stop)johansson(at)lsn(stop)se
// (browse-url "s:/wp/wpJavascriptEat/phs/PHS.html")

"use strict;";
var boj = boj || {};

boj.PHS_wci = (function (document) {

  const wtab = boj.wtab_util;
  const phsinp = boj.PHS_inpar_wci;
  const phs_sim = boj.PHS_run_sim;

  function $(selector, el) {
    if (!el) {
      el = document;
    }
    return el.querySelector(selector);
  }

  function $$(selector, el) {
    if (!el) {
      el = document;
    }
    return Array.prototype.slice.call(el.querySelectorAll(selector));
  }

  // used value of sim_time [minute]
  // array index to input data and output data are 1 for the first simulation step,
  // 2 for the second and so on.
  // Index 0 is used for input to and result of intialization
  // In output array index 0 is sometime used for state before first step
  // last index for input is SIM_STEP_LIX -1

  const SIM_STEP_LIX = 480;

  // run a simulation ========================================================

  const run_sim = phs_sim.new_run_sim();
  run_sim.diagram_x_expand(true);
  run_sim.result_time(
      [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450,
        480]);

  // Track simulation state for button management
  let simulationStarted = false;

  function doPHS(from_start) { // called from html
    run_sim.run_simulation('phs', from_start);
    run_sim.sim_inp_tab_to_html();
    run_sim.step_inp_tab_to_html();
    run_sim.sim_end_res_to_html();
    run_sim.sim_res_to_html();
    run_sim.step_log_tab_to_html();
    run_sim.step_log_to_graph($('#phs_graph'));
    
    // Update button states after simulation
    updateButtonStates(from_start);
  }

  function updateButtonStates(from_start) {
    // Get the actual buttons
    const buttons = document.querySelectorAll('button[onclick*="doPHS"]');
    const startButton = Array.from(buttons).find(btn => btn.textContent.includes('Start simulation'));
    const addButton = Array.from(buttons).find(btn => btn.textContent.includes('Add timestep'));
    
    if (!startButton || !addButton) {
      console.log('Buttons not found for state management');
      return;
    }
    
    if (from_start) {
      // First simulation - disable start button, enable add button
      simulationStarted = true;
      startButton.disabled = true;
      addButton.disabled = false;
      
      // Disable simulation parameter inputs
      disableSimulationInputs(true);
      
      console.log('Simulation started - button states updated');
    } else {
      // Additional timestep - buttons remain in current state
      console.log('Additional timestep added - button states unchanged');
    }
  }

  function disableSimulationInputs(disable) {
    // Find simulation parameter inputs (in the first parameter container)
    const simParamContainer = document.querySelector('.parameter-container');
    if (simParamContainer) {
      const inputs = simParamContainer.querySelectorAll('input, select, button');
      inputs.forEach(input => {
        input.disabled = disable;
      });
      console.log(`Simulation inputs ${disable ? 'disabled' : 'enabled'}`);
    }
    
    // Step parameters should always remain enabled
    const stepParamContainers = document.querySelectorAll('.parameter-stack');
    stepParamContainers.forEach(container => {
      const inputs = container.querySelectorAll('input, select, button');
      inputs.forEach(input => {
        input.disabled = false; // Always enable step parameters
      });
    });
  }

  // called from html =====================================================

  function onload(wtab_id) {
    wtab.onload(wtab_id);
    phsinp.onload();
    $('#ext_humidity').style.display = 'none';
    $('#ext_Trad').style.display = 'none';
    
    // Initialize button states
    initializeButtonStates();
  }

  function initializeButtonStates() {
    // Get the actual buttons
    const buttons = document.querySelectorAll('button[onclick*="doPHS"]');
    const startButton = Array.from(buttons).find(btn => btn.textContent.includes('Start simulation'));
    const addButton = Array.from(buttons).find(btn => btn.textContent.includes('Add timestep'));
    
    if (!startButton || !addButton) {
      console.log('Buttons not found for initialization');
      return;
    }
    
    // Set initial states
    simulationStarted = false;
    startButton.disabled = false;  // Start button enabled initially
    addButton.disabled = true;     // Add button disabled initially
    
    // Ensure simulation inputs are enabled initially
    disableSimulationInputs(false);
    
    console.log('Button states initialized - Start enabled, Add disabled');
  }

  function par_update(this_val) {
    const pid_arr = phsinp.par_update(this_val);
  }

  function toggle_visibility(id) {
    const e = $(id);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    } else {
      e.style.display = 'block';
    }
  }

  // external interface =======================================================

  const self = {
    onload: onload,
    wtab_select: wtab.select,
    wtab_select_all: wtab.select_all,
    par_update: par_update,
    toggle_visibility: toggle_visibility,
    doPHS: doPHS
  };

  return self;
})(document);
