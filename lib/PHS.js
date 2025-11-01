// Copyright 2015 Bo Johansson. All rights reserved
// Mail: bo(stop)johansson(at)lsn(stop)se
// Refactored for improved readability and maintainability

"use strict;";

var boj = boj || {};

/**
 * Enhanced PHS (Predicted Heat Strain) Model Module
 * Implements ISO/FDIS 7933 for thermal strain prediction
 * Provides improved organization and documentation while maintaining backward compatibility
 */
boj.PHS = (function () {
  const pdo = boj.par_data_object;

  // ==============================================================================
  // PHYSIOLOGICAL STATE CONTAINERS
  // ==============================================================================

  /**
   * Physiological state containers organized by functional area
   * Each container holds variables for that specific physiological domain
   */
  const physiologicalState = {
    air: {},      // Air properties (temperature, humidity, velocity, radiation)
    body: {},     // Body characteristics (weight, height, metabolism, etc.)
    cloth: {},    // Clothing properties (insulation, permeability, etc.)
    core: {},     // Core temperature and related calculations
    heatex: {},   // Heat exchange components (convection, radiation, etc.)
    limit: {},    // Safety limits and thresholds
    move: {},     // Movement and walking parameters
    skin: {},     // Skin temperature and sweat calculations
    sweat: {}     // Sweat production and water loss calculations
  };

  // ==============================================================================
  // SIMULATION TIMING STATE
  // ==============================================================================

  /**
   * Simulation timing and control variables
   */
  let simulationState = {
    model: NaN,           // Simulation model variant
    currentTime: NaN,     // Current simulation time
    stepStart: NaN,       // Start time of current step
    stepEnd: NaN          // End time of current step
  };

  // ==============================================================================
  // VARIABLE RESET FUNCTIONS
  // ==============================================================================

  /**
   * Resets all physiological variables to NaN
   * Ensures clean state for new simulations
   * Uses the new organized state containers
   */
  function resetPhysiologicalVariables() {
    // Air properties
    const air = physiologicalState.air;
    air.v_air = NaN;
    air.Tair = NaN;
    air.Trad = NaN;
    air.Pw_air = NaN;

    // Body properties
    const body = physiologicalState.body;
    body.accl = NaN;
    body.Adu = NaN;
    body.fAdu_rad_aux = NaN;
    body.fAdu_rad = NaN;
    body.drink = NaN;
    body.height = NaN;
    body.Met = NaN;
    body.posture = NaN;
    body.spHeat = NaN;
    body.Tbm = NaN;
    body.Tbm_0 = NaN;
    body.weight = NaN;
    body.work = NaN;

    // Clothing properties
    const cloth = physiologicalState.cloth;
    cloth.fAcl = NaN;
    cloth.Ia_st = NaN;
    cloth.CORcl = NaN;
    cloth.CORia = NaN;
    cloth.CORe = NaN;
    cloth.CORtot = NaN;
    cloth.Icl_dyn = NaN;
    cloth.im_dyn = NaN;
    cloth.Rtdyn = NaN;
    cloth.fAcl_rad = NaN;
    cloth.Fr = NaN;
    cloth.fAref = NaN;
    cloth.Icl_st = NaN;
    cloth.im_st = NaN;
    cloth.Tcl = NaN;
    cloth.Icl = NaN;
    cloth.Itot_dyn = NaN;
    cloth.Itot_st = NaN;

    // Core temperature properties
    const core = physiologicalState.core;
    core.dStoreq = NaN;
    core.sk_cr_rel = NaN;
    core.sk_cr_rel_0 = NaN;
    core.Tcr = NaN;
    core.Tcr_0 = NaN;
    core.Tcr_1 = NaN;
    core.Tcreq_rm_ss = NaN;
    core.Tcreq_mr_0 = NaN;
    core.Tcreq_mr = NaN;
    core.Tcreq_mr_ConstTeq = NaN;
    core.Trec_0 = NaN;
    core.Trec = NaN;

    // Heat exchange properties
    const heatex = physiologicalState.heatex;
    heatex.Hcdyn = NaN;
    heatex.Hr = NaN;
    heatex.Conv = NaN;
    heatex.Rad = NaN;
    heatex.Eresp = NaN;
    heatex.Cresp = NaN;
    heatex.Tresp = NaN;
    heatex.Z = NaN;

    // Safety limits
    const limit = physiologicalState.limit;
    limit.rec_temp = NaN;
    limit.sweat_max50 = NaN;
    limit.sweat_max95 = NaN;
    limit.water_loss_max50 = NaN;
    limit.water_loss_max95 = NaN;

    // Movement properties
    const move = physiologicalState.move;
    move.v_walk_in = NaN;
    move.v_air_rel = NaN;
    move.walk_dir = NaN;
    move.walk_dir_in = NaN;
    move.v_walk = NaN;

    // Reset simulation state
    simulationState.model = NaN;
    simulationState.currentTime = NaN;
    simulationState.stepStart = NaN;
    simulationState.stepEnd = NaN;

    // Sweat properties
    const sweat = physiologicalState.sweat;
    sweat.Emax = NaN;
    sweat.Epre = NaN;
    sweat.Ereq = NaN;
    sweat.SWmax = NaN;
    sweat.SWpre = NaN;
    sweat.SWreq = NaN;
    sweat.SW = NaN;
    sweat.SWg = NaN;
    sweat.SWtot = NaN;
    sweat.SWtotg = NaN;
    sweat.Eeff_req = NaN;
    sweat.ConstSW = NaN;
    sweat.fSWmax_accl = NaN;
  }

  let par_sim_mod = false;

  /**
   * Parameter specifications for simulation-level settings
   * These define the person characteristics that don't change during simulation
   */
  const parameterSpecsSimulation = [['accl', 'int', function () {
    return physiologicalState.body.accl;
  }, function (val) {
    physiologicalState.body.accl = val === 0 ? 0 : 100;
    par_sim_mod = true;
  }, {
    def_val: 100,
    min: 0,
    max: 100,
    unit: '%',
    symbol: 'accl',
    descr: 'Acclimatised subject 0 or 100'
  }], ['drink', 'int', function () {
    return physiologicalState.body.drink;
  }, function (val) {
    physiologicalState.body.drink = val === 0 ? 0 : 1;
    par_sim_mod = true;
  }, {
    def_val: 1,
    min: 0,
    max: 1,
    unit: '',
    symbol: 'drink',
    descr: 'May drink freely, 0 or 1'
  }], ['height', 'float', function () {
    return physiologicalState.body.height;
  }, function (val) {
    physiologicalState.body.height = val;
    par_sim_mod = true;
  }, {
    def_val: 1.8,
    min: 1.5,
    max: 2.4,
    dec_nof: 1,
    unit: 'm',
    symbol: 'height',
    descr: 'Body height'
  }], ['mass', 'float', function () {
    return physiologicalState.body.weight;
  }, function (val) {
    physiologicalState.body.weight = val;
    par_sim_mod = true;
  }, {
    def_val: 75,
    min: 0,
    max: 120,
    dec_nof: 1,
    unit: 'kg',
    symbol: 'mass',
    descr: 'Body mass'
  }], // sim_mod = 0 default,
    //         = 1 iso7933 ver. 1,
    //         = 2 iso7933 ver. 2,
    //         = 3 as 1 and modified core_temp_pred,
    //         = 4 as 2 and modified core_temp_pred
    ['sim_mod', 'int', function () {
      return simulationState.model;
    }, function (val) {
      simulationState.model = val;
      par_sim_mod = true;
    }, {
      def_val: 0,
      min: 0,
      max: 4,
      unit: '',
      symbol: 'sim_mod',
      descr: 'Simulation model variant'
    }]];

  // Create parameter swarm for simulation settings
  const parameterSwarmSimulation = pdo.new_par_swarm('phs_sim').create_parameter(
      parameterSpecsSimulation);

  // Legacy compatibility
  const par_spec_sim = parameterSpecsSimulation;
  const par_swarm_sim = parameterSwarmSimulation;

  let par_step_mod = false;

  /**
   * Parameter specifications for step-level settings
   * These define environmental conditions that can change each time step
   */
  const parameterSpecsStep = [['post', 'int', function () {
    return physiologicalState.body.posture;
  }, function (val) {
    physiologicalState.body.posture = val;
    par_step_mod = true;
  }, {
    def_val: 2,
    min: 1,
    max: 3,
    unit: '',
    symbol: 'post',
    descr: '1= sitting, 2= standing, 3= crouching'
  }], ['Tair', 'float', function () {
    return physiologicalState.air.Tair;
  }, function (val) {
    physiologicalState.air.Tair = val;
    par_step_mod = true;
  }, {
    def_val: 40,
    min: 15,
    max: 50,
    dec_nof: 1,
    unit: 'C',
    symbol: 'Tair',
    descr: 'Air temperature'
  }], ['Pw_air', 'float', function () {
    return physiologicalState.air.Pw_air;
  }, function (val) {
    physiologicalState.air.Pw_air = val;
    par_step_mod = true;
  }, {
    def_val: 2.5,
    min: 0,
    max: 4.5,
    dec_nof: 1,
    unit: 'kPa',
    symbol: 'Pw_air',
    descr: 'Partial water vapour pressure'
  }], ['Trad', 'float', function () {
    return physiologicalState.air.Trad;
  }, function (val) {
    physiologicalState.air.Trad = val;
    par_step_mod = true;
  }, {
    def_val: 40,
    min: 15,
    max: 110,
    dec_nof: 1,
    unit: 'C',
    symbol: 'Trad',
    descr: 'Radiant temperature'
  }], ['v_air', 'float', function () {
    return physiologicalState.air.v_air;
  }, function (val) {
    physiologicalState.air.v_air = val;
    par_step_mod = true;
  }, {
    def_val: 0.3,
    min: 0,
    max: 3.0,
    dec_nof: 1,
    unit: 'm/s',
    symbol: 'v_air',
    descr: 'Air velocity'
  }], ['Met', 'int', function () {
    return physiologicalState.body.Met;
  }, function (val) {
    physiologicalState.body.Met = val;
    par_step_mod = true;
  }, {
    def_val: 150,
    min: 100,
    max: 400,
    unit: 'W/m2',
    symbol: 'Met',
    descr: 'Metabolic energy production'
  }], ['Icl', 'float', function () {
    return physiologicalState.cloth.Icl;
  }, function (val) {
    physiologicalState.cloth.Icl = val;
    par_step_mod = true;
  }, {
    def_val: 0.5,
    min: 0.1,
    max: 1.2,
    dec_nof: 1,
    unit: 'clo',
    symbol: 'Icl',
    descr: 'Cloth static thermal insulation'
  }], ['im_st', 'float', function () {
    return physiologicalState.cloth.im_st;
  }, function (val) {
    physiologicalState.cloth.im_st = val;
    par_step_mod = true;
  }, {
    def_val: 0.38,
    min: 0,
    max: 1.0,
    dec_nof: 2,
    unit: '',
    symbol: 'im_st',
    descr: 'Static moisture permeability index'
  }], ['fAref', 'float', function () {
    return physiologicalState.cloth.fAref;
  }, function (val) {
    physiologicalState.cloth.fAref = val;
    par_step_mod = true;
  }, {
    def_val: 0.54,
    min: 0,
    max: 1.0,
    dec_nof: 2,
    unit: '',
    symbol: 'Ap',
    descr: 'Fraction covered by reflective clothing'
  }], ['Fr', 'float', function () {
    return physiologicalState.cloth.Fr;
  }, function (val) {
    physiologicalState.cloth.Fr = val;
    par_step_mod = true;
  }, {
    def_val: 0.97,
    min: 0,
    max: 1.0,
    dec_nof: 2,
    unit: '',
    symbol: 'Fr',
    descr: 'Emissivity reflective clothing'
  }], ['walk_dir', 'int', function () {
    return physiologicalState.move.walk_dir_in;
  }, function (val) {
    physiologicalState.move.walk_dir_in = val;
    par_step_mod = true;
  }, {
    def_val: NaN,
    min: 0,
    max: 360,
    unit: 'degree',
    symbol: 'theta_ww',
    descr: 'Angel between wind and walking direction',
    may_be_null: true
  }], ['v_walk', 'float', function () {
    return physiologicalState.move.v_walk_in;
  }, function (val) {
    physiologicalState.move.v_walk_in = val;
    par_step_mod = true;
  }, {
    def_val: NaN,
    min: 0,
    max: 1.2,
    dec_nof: 1,
    unit: 'm/s',
    symbol: 'v_walk',
    descr: 'Walking speed',
    may_be_null: true
  }], ['work', 'int', function () {
    return physiologicalState.body.work;
  }, function (val) {
    physiologicalState.body.work = val;
    par_step_mod = true;
  }, {
    def_val: 0,
    min: 0,
    max: 200,
    unit: 'W/m2',
    symbol: 'body_work',
    descr: 'Mechanical power'
  }], ['timestep', 'int', function () {
    return simulationState.stepEnd;
  }, function (val) {
    simulationState.stepEnd = val;
    par_step_mod = true;
  }, {
    def_val: 30,
    min: 1,
    max: 480,
    unit: 'min',
    symbol: 'step_end_time',
    descr: 'Time when the next step ends'
  }]];

  // Create parameter swarm for step settings
  const parameterSwarmStep = pdo.new_par_swarm('phs_step').create_parameter(
      parameterSpecsStep);

  // Legacy compatibility
  const par_spec_step = parameterSpecsStep;
  const par_swarm_step = parameterSwarmStep;

  let branch_reg = {};
  const flag = 0;

  function branch(id) {
    if (branch_reg[id]) {
      branch_reg[id]++;
    } else {
      branch_reg[id] = 1;
    }
  }

  function branch_reset() {
    const res = JSON.stringify(branch_reg);
    branch_reg = {};
    return res;
  }

  function calc_sim_const() {
    if (simulationState.model === 0) {
      simulationState.model = 1;
    }
    physiologicalState.body.Adu = 0.202 * Math.pow(physiologicalState.body.weight, 0.425) * Math.pow(physiologicalState.body.height,
        0.725);
    physiologicalState.body.spHeat = 57.83 * physiologicalState.body.weight / physiologicalState.body.Adu;
    if (physiologicalState.body.drink === 1) {
      physiologicalState.limit.sweat_max50 = 0.075 * physiologicalState.body.weight * 1000;
      physiologicalState.limit.sweat_max95 = 0.05 * physiologicalState.body.weight * 1000;
    } else {
      physiologicalState.limit.sweat_max50 = 0.03 * physiologicalState.body.weight * 1000;
      physiologicalState.limit.sweat_max95 = 0.03 * physiologicalState.body.weight * 1000;
    }
    if (physiologicalState.body.accl < 50) {
      physiologicalState.skin.w_max = 0.85;
    } else {
      physiologicalState.skin.w_max = 1;
    }
    physiologicalState.core.Tcreq_mr_ConstTeq = Math.exp(-1 / 10);

    physiologicalState.skin.ConstTsk = Math.exp(-1 / 3);
    physiologicalState.sweat.ConstSW = Math.exp(-1 / 10);
    par_sim_mod = false;
    calc_step_const();
  }

  function calc_step_const() {
    const posture = physiologicalState.body.posture;
    if (posture === 1) {
      physiologicalState.body.fAdu_rad = 0.7;
    } else if (posture === 2) {
      physiologicalState.body.fAdu_rad = 0.77;
    } else if (posture === 3) {
      physiologicalState.body.fAdu_rad = 0.67;
    } else {
      physiologicalState.body.fAdu_rad = 0.7;
    }
    physiologicalState.body.fAdu_rad_aux = 5.67E-08 * physiologicalState.body.fAdu_rad;
    if (simulationState.model === 1 || simulationState.model === 3) { // iso7933 ver. 1
      physiologicalState.sweat.SWmax = (physiologicalState.body.Met - 32) * physiologicalState.body.Adu;
      if (physiologicalState.sweat.SWmax > 400) {
        physiologicalState.sweat.SWmax = 400;
      }
      if (physiologicalState.sweat.SWmax < 250) {
        physiologicalState.sweat.SWmax = 250;
      }
    } else if (simulationState.model === 2 || simulationState.model === 4) { // iso7933 modified
      physiologicalState.sweat.SWmax = 400;
    } else {
      alert('ERROR in calc_step_const ' + simulationState.model);
    }
    if (physiologicalState.body.accl >= 50) {
      physiologicalState.sweat.SWmax = physiologicalState.sweat.SWmax * 1.25;
    }
    physiologicalState.core.Tcreq_rm_ss = 0.0036 * physiologicalState.body.Met + 36.6;
    physiologicalState.cloth.Icl_st = physiologicalState.cloth.Icl * 0.155;
    physiologicalState.cloth.fAcl = 1 + 0.3 * physiologicalState.cloth.Icl;
    physiologicalState.cloth.Ia_st = 0.111;
    physiologicalState.cloth.Itot_st = physiologicalState.cloth.Icl_st + physiologicalState.cloth.Ia_st / physiologicalState.cloth.fAcl;
    if (!isNaN(physiologicalState.move.v_walk_in)) {
      physiologicalState.move.v_walk = physiologicalState.move.v_walk_in;
      if (!isNaN(physiologicalState.move.walk_dir_in)) {
        physiologicalState.move.v_air_rel = Math.abs(physiologicalState.air.v_air - physiologicalState.move.v_walk * Math.cos(
            3.14159 * physiologicalState.move.walk_dir_in / 180));
      } else {
        if (physiologicalState.air.v_air < physiologicalState.move.v_walk) {
          physiologicalState.move.v_air_rel = physiologicalState.move.v_walk;
        } else {
          physiologicalState.move.v_air_rel = physiologicalState.air.v_air;
        }
      }
    } else {
      physiologicalState.move.v_walk = 0.0052 * (physiologicalState.body.Met - 58);
      if (physiologicalState.move.v_walk > 0.7) {
        physiologicalState.move.v_walk = 0.7;
      }
      physiologicalState.move.v_air_rel = physiologicalState.air.v_air;
    }
    physiologicalState.heatex.Tresp = 28.56 + 0.115 * physiologicalState.air.Tair + 0.641 * physiologicalState.air.Pw_air;
    physiologicalState.heatex.Cresp = 0.001516 * physiologicalState.body.Met * (physiologicalState.heatex.Tresp - physiologicalState.air.Tair);
    physiologicalState.heatex.Eresp = 0.00127 * physiologicalState.body.Met * (59.34 + 0.53 * physiologicalState.air.Tair - 11.63
        * physiologicalState.air.Pw_air);
    if (physiologicalState.move.v_air_rel > 1) {
      physiologicalState.heatex.Z = 8.7 * Math.pow(physiologicalState.move.v_air_rel, 0.6);
    } else {
      physiologicalState.heatex.Z = 3.5 + 5.2 * physiologicalState.move.v_air_rel;
    }
    par_step_mod = false;
  }

  function reset() {
    resetPhysiologicalVariables();
  }

  function sim_init() {
    physiologicalState.limit.rec_temp = NaN;
    physiologicalState.limit.water_loss_max50 = NaN;
    physiologicalState.limit.water_loss_max95 = NaN;
    physiologicalState.sweat.SWpre = 0;
    physiologicalState.sweat.SWtot = 0;
    physiologicalState.sweat.SWtotg = 0;
    physiologicalState.core.Trec = 36.8;
    physiologicalState.core.Tcr = 36.8;
    physiologicalState.skin.Tsk = 34.1;
    //body.Tbm = 36.394922930774554;
    //body.Tbm = 36.4;
    physiologicalState.body.Tbm = 36.39488;
    physiologicalState.core.Tcreq_mr = 36.8;
    physiologicalState.core.sk_cr_rel = 0.3;
    physiologicalState.cloth.Tcl = NaN;
    physiologicalState.sweat.Epre = NaN;
    physiologicalState.sweat.SW = NaN;
    physiologicalState.sweat.SWg = NaN;
    physiologicalState.sweat.SWmax = NaN;
    physiologicalState.sweat.SWreq = NaN;
    simulationState.currentTime = 0;
    simulationState.stepStart = 0

    branch_reset();
    calc_sim_const();
    calc_step_const();
  }

  function step_core_temp_equi_mr() {
    const Tcreqm = physiologicalState.core.Tcreq_rm_ss;
    const ConstTeq = physiologicalState.core.Tcreq_mr_ConstTeq;
    const val_0 = physiologicalState.core.Tcreq_mr_0;
    physiologicalState.core.Tcreq_mr = val_0 * ConstTeq + Tcreqm * (1 - ConstTeq);
    physiologicalState.core.dStoreq = physiologicalState.body.spHeat * (physiologicalState.core.Tcreq_mr - val_0) * (1
        - physiologicalState.core.sk_cr_rel_0);
  }

  function skin_temp_equilibrium() {
    const Tskeq_cl = 12.165 + 0.02017 * physiologicalState.air.Tair + 0.04361 * physiologicalState.air.Trad + 0.19354
        * physiologicalState.air.Pw_air - 0.25315 * physiologicalState.air.v_air + 0.005346 * physiologicalState.body.Met + 0.51274
        * physiologicalState.core.Trec;
    const Tskeq_nu = 7.191 + 0.064 * physiologicalState.air.Tair + 0.061 * physiologicalState.air.Trad + 0.198
        * physiologicalState.air.Pw_air - 0.348 * physiologicalState.air.v_air + 0.616 * physiologicalState.core.Trec;
    const I_cl = physiologicalState.cloth.Icl;
    if (I_cl <= 0.2) {
      return Tskeq_nu;
    }
    if (I_cl >= 0.6) {
      return Tskeq_cl;
    }
    const Tskeq = Tskeq_nu + 2.5 * (Tskeq_cl - Tskeq_nu) * (I_cl - 0.2);
    return Tskeq;
  }

  function step_skin_temp() {
    const Tskeq = skin_temp_equilibrium();
    const ConstTsk = physiologicalState.skin.ConstTsk;
    physiologicalState.skin.Tsk = physiologicalState.skin.Tsk_0 * ConstTsk + Tskeq * (1 - ConstTsk);
    physiologicalState.skin.Pw_sk = 0.6105 * Math.exp(17.27 * physiologicalState.skin.Tsk / (physiologicalState.skin.Tsk + 237.3));
  }

  function calc_dynamic_insulation() {
    let Vaux = physiologicalState.move.v_air_rel;
    if (physiologicalState.move.v_air_rel > 3) {
      Vaux = 3;
    }
    let Waux = physiologicalState.move.v_walk;
    if (physiologicalState.move.v_walk > 1.5) {
      Waux = 1.5;
    }
    physiologicalState.cloth.CORcl = 1.044 * Math.exp(
        (0.066 * Vaux - 0.398) * Vaux + (0.094 * Waux - 0.378) * Waux);
    if (physiologicalState.cloth.CORcl > 1) {
      physiologicalState.cloth.CORcl = 1;
    }
    physiologicalState.cloth.CORia = Math.exp(
        (0.047 * physiologicalState.move.v_air_rel - 0.472) * physiologicalState.move.v_air_rel + (0.117 * Waux
            - 0.342) * Waux);
    if (physiologicalState.cloth.CORia > 1) {
      physiologicalState.cloth.CORia = 1;
    }
    physiologicalState.cloth.CORtot = physiologicalState.cloth.CORcl;
    if (physiologicalState.cloth.Icl <= 0.6) {
      physiologicalState.cloth.CORtot = ((0.6 - physiologicalState.cloth.Icl) * physiologicalState.cloth.CORia + physiologicalState.cloth.Icl * physiologicalState.cloth.CORcl)
          / 0.6;
    }
    physiologicalState.cloth.Itot_dyn = physiologicalState.cloth.Itot_st * physiologicalState.cloth.CORtot;
    const IAdyn = physiologicalState.cloth.CORia * physiologicalState.cloth.Ia_st;
    physiologicalState.cloth.Icl_dyn = physiologicalState.cloth.Itot_dyn - IAdyn / physiologicalState.cloth.fAcl;

    physiologicalState.cloth.CORe = (2.6 * physiologicalState.cloth.CORtot - 6.5) * physiologicalState.cloth.CORtot + 4.9;
    physiologicalState.cloth.im_dyn = physiologicalState.cloth.im_st * physiologicalState.cloth.CORe;
    if (physiologicalState.cloth.im_dyn > 0.9) {
      physiologicalState.cloth.im_dyn = 0.9;
    }
    physiologicalState.cloth.Rtdyn = physiologicalState.cloth.Itot_dyn / physiologicalState.cloth.im_dyn / 16.7;
  }

  function dynamic_convection_coefficient() {
    physiologicalState.heatex.Hcdyn = 2.38 * Math.pow(Math.abs(physiologicalState.skin.Tsk - physiologicalState.air.Tair), 0.25);
    if (physiologicalState.heatex.Z > physiologicalState.heatex.Hcdyn) {
      physiologicalState.heatex.Hcdyn = physiologicalState.heatex.Z;
    }
    physiologicalState.cloth.fAcl_rad = (1 - physiologicalState.cloth.fAref) * 0.97 + physiologicalState.cloth.fAref * physiologicalState.cloth.Fr;
  }

  function clothing_temp() {
    const Hcdyn = physiologicalState.heatex.Hcdyn;
    let Trad_K_pow4 = physiologicalState.air.Trad + 273;
    Trad_K_pow4 = Trad_K_pow4 * Trad_K_pow4;
    Trad_K_pow4 = Trad_K_pow4 * Trad_K_pow4;
    let Tcl1;
    let loop = 20;

    physiologicalState.cloth.Tcl = physiologicalState.air.Trad + 0.1;
    while (loop > 0) {
      loop--;
      let Tcl_K_pow4 = physiologicalState.cloth.Tcl + 273;
      Tcl_K_pow4 = Tcl_K_pow4 * Tcl_K_pow4;
      Tcl_K_pow4 = Tcl_K_pow4 * Tcl_K_pow4;
      physiologicalState.heatex.Hr = physiologicalState.cloth.fAcl_rad * physiologicalState.body.fAdu_rad_aux * (Tcl_K_pow4
          - Trad_K_pow4) / (physiologicalState.cloth.Tcl - physiologicalState.air.Trad);
      Tcl1 = ((physiologicalState.cloth.fAcl * (Hcdyn * physiologicalState.air.Tair + physiologicalState.heatex.Hr * physiologicalState.air.Trad) + physiologicalState.skin.Tsk
          / physiologicalState.cloth.Icl_dyn)) / (physiologicalState.cloth.fAcl * (Hcdyn + physiologicalState.heatex.Hr) + 1
          / physiologicalState.cloth.Icl_dyn);
      if (Math.abs(physiologicalState.cloth.Tcl - Tcl1) > 0.001) {
        physiologicalState.cloth.Tcl = (physiologicalState.cloth.Tcl + Tcl1) / 2;
      } else {
        return;
      }
    }
    alert('clothing_temp overun');
  }

  function calc_heat_exchange() {
    physiologicalState.heatex.Conv = physiologicalState.cloth.fAcl * physiologicalState.heatex.Hcdyn * (physiologicalState.cloth.Tcl - physiologicalState.air.Tair);
    physiologicalState.heatex.Rad = physiologicalState.cloth.fAcl * physiologicalState.heatex.Hr * (physiologicalState.cloth.Tcl - physiologicalState.air.Trad);
    physiologicalState.sweat.Ereq = physiologicalState.body.Met - physiologicalState.core.dStoreq - physiologicalState.body.work - physiologicalState.heatex.Cresp
        - physiologicalState.heatex.Eresp - physiologicalState.heatex.Conv - physiologicalState.heatex.Rad;
  }

  function sweat_rate() {
    physiologicalState.sweat.Emax = (physiologicalState.skin.Pw_sk - physiologicalState.air.Pw_air) / physiologicalState.cloth.Rtdyn;
    if (physiologicalState.sweat.Ereq <= 0) {
      physiologicalState.sweat.Ereq = 0;
      physiologicalState.sweat.SWreq = 0;
      //trace branch( 'sr1');
    } else if (physiologicalState.sweat.Emax <= 0) {
      physiologicalState.sweat.Emax = 0;
      physiologicalState.sweat.SWreq = physiologicalState.sweat.SWmax;
      //trace branch( 'sr2');
    } else {
      physiologicalState.skin.w_req = physiologicalState.sweat.Ereq / physiologicalState.sweat.Emax;
      if (physiologicalState.skin.w_req >= 1.7) {
        physiologicalState.skin.w_req = 1.7;
        physiologicalState.sweat.SWreq = physiologicalState.sweat.SWmax;
        //trace branch( 'sr3.1');
      } else {
        if (physiologicalState.skin.w_req > 1) {
          physiologicalState.sweat.Eeff_req = (2 - physiologicalState.skin.w_req) * (2 - physiologicalState.skin.w_req) / 2;
          //trace branch( 'sr3.2.1');
        } else {
          physiologicalState.sweat.Eeff_req = 1 - (physiologicalState.skin.w_req * physiologicalState.skin.w_req / 2);
          //trace branch( 'sr3.2.2');
        }
        physiologicalState.sweat.SWreq = physiologicalState.sweat.Ereq / physiologicalState.sweat.Eeff_req;
        if (physiologicalState.sweat.SWreq > physiologicalState.sweat.SWmax) {
          physiologicalState.sweat.SWreq = physiologicalState.sweat.SWmax;
          //trace branch( 'sr3.2.3');
        }
      }
    }
    physiologicalState.sweat.SWpre = physiologicalState.sweat.SWpre * physiologicalState.sweat.ConstSW + physiologicalState.sweat.SWreq * (1
        - physiologicalState.sweat.ConstSW);
    if (physiologicalState.sweat.SWpre <= 0) {
      physiologicalState.sweat.Epre = 0;
      physiologicalState.sweat.SWpre = 0;
      //trace branch( 'sp1');
    } else {
      const k = physiologicalState.sweat.Emax / physiologicalState.sweat.SWpre;
      physiologicalState.skin.w_pre = 1;
      if (k >= 0.5) {
        physiologicalState.skin.w_pre = -k + Math.sqrt(k * k + 2);
        //trace branch( 'sp2.1');
      }
      if (physiologicalState.skin.w_pre > physiologicalState.skin.w_max) {
        physiologicalState.skin.w_pre = physiologicalState.skin.w_max;
        //trace branch( 'sp2.2')
      }
      physiologicalState.sweat.Epre = physiologicalState.skin.w_pre * physiologicalState.sweat.Emax;
    }
    //trace if ( simulationState.currentTime <=5 || (simulationState.currentTime % 40) === 0 ){
    //trace     console.log( JSON.stringify(
    //trace         {time: simulationState.currentTime, Ereq: sweat.Ereq, Eeff_req: sweat.Eeff_req,
    //trace          SWreq: sweat.SWreq, SWpre: sweat.SWpre, Epre: sweat.Epre }
    //trace     ) + branch_reset() )
    //trace }
  }

  function core_temp_pred_std() {
    const dStorage = physiologicalState.sweat.Ereq - physiologicalState.sweat.Epre + physiologicalState.core.dStoreq;
    physiologicalState.core.Tcr_1 = physiologicalState.core.Tcr_0;

    let loop = 25;
    while (loop > 0) {
      loop--;
      physiologicalState.core.sk_cr_rel = 0.3 - 0.09 * (physiologicalState.core.Tcr_1 - 36.8);
      if (physiologicalState.core.sk_cr_rel > 0.3) {
        physiologicalState.core.sk_cr_rel = 0.3;
      }
      if (physiologicalState.core.sk_cr_rel < 0.1) {
        physiologicalState.core.sk_cr_rel = 0.1;
      }
      physiologicalState.core.Tcr = dStorage / physiologicalState.body.spHeat + physiologicalState.skin.Tsk_0 * physiologicalState.core.sk_cr_rel_0 / 2
          - physiologicalState.skin.Tsk * physiologicalState.core.sk_cr_rel / 2;
      physiologicalState.core.Tcr = (physiologicalState.core.Tcr + physiologicalState.core.Tcr_0 * (1 - physiologicalState.core.sk_cr_rel_0 / 2)) / (1
          - physiologicalState.core.sk_cr_rel / 2);
      if (Math.abs(physiologicalState.core.Tcr - physiologicalState.core.Tcr_1) > 0.001) {
        physiologicalState.core.Tcr_1 = (physiologicalState.core.Tcr_1 + physiologicalState.core.Tcr) / 2;
      } else {
        return;
      }
    }
    alert('core_temp_pred_std overun');
  }

  // part of body having Tcr as mean temperature
  function core_temp_pred_sk_cr_rel(Tcr) {
    if (Tcr < 36.8) {
      return 0.3;
    } else if (Tcr > 39.0) {
      return 0.1;
    } else {
      return 0.3 - 0.091 * (Tcr - 36.8);
    }
  }

  function core_temp_pred_Tcr(Tbm, Tcr_0, Tsk) {
    let Tcr = Tbm;
    let loop = 25;
    while (loop > 0) {
      loop--;
      const sk_cr_rel_0_5 = core_temp_pred_sk_cr_rel(Tcr) * 0.5;
      //Tbm_1 = Tcr * ( 1 - sk_cr_rel ) + (Tsk + Tcr)* 0.5 * sk_cr_rel;
      //Tbm_1 = Tcr  - Tcr * sk_cr_rel + Tsk * sk_cr_rel * 0.5 + Tcr * sk_cr_rel * 0.5;
      //Tbm_1 = Tcr( 1  - sk_cr_rel + sk_cr_rel * 0.5 ) + Tsk * sk_cr_rel * 0.5;
      //Tbm_1 = Tcr( 1 - sk_cr_rel * 0.5 ) + Tsk * sk_cr_rel * 0.5;
      Tbm_1 = Tcr * (1 - sk_cr_rel_0_5) + Tsk * sk_cr_rel_0_5;
      const diff = Tbm_1 - Tbm;
      if (Math.abs(diff) > 0.001) {
        Tcr = Tcr - diff * 0.5;
      } else {
        return Tcr;
      }
    }
    console.error('core_temp_pred overun' + simulationState.currentTime + Tcr);
    return Tcr;
  }

  function core_temp_pred() {
    const dStorage = physiologicalState.sweat.Ereq - physiologicalState.sweat.Epre + physiologicalState.core.dStoreq;
    const dTempStorage = dStorage / physiologicalState.body.spHeat;
    physiologicalState.body.Tbm = physiologicalState.body.Tbm_0 + dTempStorage;
    const rv = core_temp_pred_Tcr(physiologicalState.body.Tbm, physiologicalState.core.Tcr_0, physiologicalState.skin.Tsk);
    physiologicalState.core.Tcr = rv;
  }

  function rect_temp_pred() {
    const Tre0 = physiologicalState.core.Trec_0;
    physiologicalState.core.Trec = Tre0 + (2 * physiologicalState.core.Tcr - 1.962 * Tre0 - 1.31) / 9;
    if (!physiologicalState.limit.rec_temp && physiologicalState.core.Trec >= 38) {
      physiologicalState.limit.rec_temp = simulationState.currentTime;
    }
  }

  function water_loss() {
    physiologicalState.sweat.SW = physiologicalState.sweat.SWpre + physiologicalState.heatex.Eresp;
    physiologicalState.sweat.SWtot = physiologicalState.sweat.SWtot + physiologicalState.sweat.SW;
    const k_to_g = 2.67 * physiologicalState.body.Adu / 1.8 / 60;
    physiologicalState.sweat.SWg = physiologicalState.sweat.SW * k_to_g;
    physiologicalState.sweat.SWtotg = physiologicalState.sweat.SWtot * k_to_g;
    if (!physiologicalState.limit.water_loss_max50 && physiologicalState.sweat.SWtotg >= physiologicalState.limit.sweat_max50) {
      physiologicalState.limit.water_loss_max50 = simulationState.currentTime;
    }
    if (!physiologicalState.limit.water_loss_max95 && physiologicalState.sweat.SWtotg >= physiologicalState.limit.sweat_max95) {
      physiologicalState.limit.water_loss_max95 = simulationState.currentTime;
    }
  }

  function set_start_time() {
    simulationState.stepStart = simulationState.currentTime;
  }

  function state() {
    return {
      time: simulationState.currentTime,
      step_start_time: simulationState.stepStart,
      step_end_time: simulationState.stepEnd,
      Tcreq: physiologicalState.core.Tcreq_mr,
      Tsk: physiologicalState.skin.Tsk,
      SWg: physiologicalState.sweat.SWg,
      SWtotg: physiologicalState.sweat.SWtotg,
      Tcr: physiologicalState.core.Tcr,
      Tre: physiologicalState.core.Trec,
      Tcl: physiologicalState.cloth.Tcl,
      SW: physiologicalState.sweat.SW,
      Epre: physiologicalState.sweat.Epre,
      SWreq: physiologicalState.sweat.SWreq,
      SWmax: physiologicalState.sweat.SWmax
    };
  }

  function time_step() {
    if (par_sim_mod) {
      alert('Simulation parameter changed between steps');
    }
    if (par_step_mod) {
      calc_step_const();
    }
    simulationState.currentTime++;
    physiologicalState.body.Tbm_0 = physiologicalState.body.Tbm;
    physiologicalState.core.Trec_0 = physiologicalState.core.Trec;
    physiologicalState.core.Tcr_0 = physiologicalState.core.Tcr;
    physiologicalState.core.Tcreq_mr_0 = physiologicalState.core.Tcreq_mr;
    physiologicalState.core.sk_cr_rel_0 = physiologicalState.core.sk_cr_rel;
    physiologicalState.skin.Tsk_0 = physiologicalState.skin.Tsk;

    step_core_temp_equi_mr();
    step_skin_temp();
    calc_dynamic_insulation();
    dynamic_convection_coefficient();
    clothing_temp();
    calc_heat_exchange();
    sweat_rate();
    if (simulationState.model === 1 || simulationState.model === 2) { //  std core_temp_pred
      core_temp_pred_std();
    } else { //  modified core_temp_pred
      core_temp_pred();
    }
    rect_temp_pred();
    water_loss();

    return state();
  }

  function current_result() {
    return {
      time: simulationState.currentTime,
      Tre: physiologicalState.core.Trec,
      SWtotg: physiologicalState.sweat.SWtotg,
      D_Tre: physiologicalState.limit.rec_temp,
      Dwl50: physiologicalState.limit.water_loss_max50,
      Dwl95: physiologicalState.limit.water_loss_max95
    };
  }

  function sample_get() {
    const phs_data = physiologicalState; // Use the new organized state
    const vid = ['core:Tcreq_rm_ss', 'core:Tcreq_mr', 'core:dStoreq',
      'skin:Tsk', 'skin:Pw_sk', 'move:v_air_rel', 'cloth:CORcl', 'cloth:CORia',
      'cloth:CORtot', 'cloth:Itot_dyn', 'cloth:Icl_dyn', 'cloth:CORe',
      'cloth:Rtdyn', 'heatex:Hcdyn', 'cloth:fAcl_rad', 'cloth:Tcl', 'heatex:Hr',
      'heatex:Conv', 'heatex:Rad', 'sweat:Ereq', 'sweat:Emax', 'skin:w_req',
      'sweat:SWpre', 'skin:w_pre', 'sweat:Epre', 'core:sk_cr_rel', 'core:Tcr',
      'core:Trec', 'sweat:SWtot', 'sweat:SWtotg'];

    const res = {
      sim_time: simulationState.currentTime, sim_mod: simulationState.model
    };
    let idp;
    let tag;
    let val;

    vid.map(function (ai) {
      idp = ai.split(':');
      tag = idp.join('_');
      let val = phs_data;
      idp.map(function (id) {
        val = val [id];
      });
      res[tag] = val;
    });

    return res;
  }

  // Reveal public pointers to private functions and properties
  return {
    // Clean modern API
    parameterSpecs: {
      simulation: parameterSpecsSimulation,
      step: parameterSpecsStep
    },
    parameterSwarms: {
      simulation: parameterSwarmSimulation,
      step: parameterSwarmStep
    },
    physiologicalState: physiologicalState,
    simulationState: simulationState,
    resetPhysiologicalVariables: resetPhysiologicalVariables,
    
    // Original functions (now using organized state internally)
    reset: reset,
    sim_init: sim_init,
    state: state,
    time_step: time_step,
    current_result: current_result,
    sample_get: sample_get,
    set_start_time: set_start_time,
    
    // Legacy parameter API names for compatibility
    par_spec_sim: parameterSpecsSimulation,
    par_spec_step: parameterSpecsStep,
    par_swarm_sim: parameterSwarmSimulation,
    par_swarm_step: parameterSwarmStep
  };
})();
