// Copyright 2014 Bo Johansson. All rights reserved
// Mail: bo(stop)johansson(at)lsn(stop)se
// (browse-url "s:/wp/wpJavascriptEat/phs/PHS.html")

"use strict;";
var boj = boj || {};

boj.PHS_wci = ( function (document) {

    var wtab = boj.wtab_util;
    var phsinp  = boj.PHS_inpar_wci;
    var phs_sim = boj.PHS_run_sim;

    function $ (selector, el) {
        if (!el) {el = document;}
        return el.querySelector(selector);
    }
    
    function $$ (selector, el) {
        if (!el) {el = document;}
        return Array.prototype.slice.call(el.querySelectorAll(selector));
    }

    // used value of sim_time [minute]
    // array index to input data and output data are 1 for the first simulation step,
    // 2 for the second and so on.
    // Index 0 is used for input to and result of intialization
    // In output array index 0 is sometime used for state before first step
    // last index for input is SIM_STEP_LIX -1

    var SIM_STEP_LIX = 480;

    // run a simulation ========================================================

    var run_sim = phs_sim.new_run_sim();
    run_sim.diagram_x_expand( true );
    run_sim.result_time(
        [ 30, 60, 90, 120, 150, 180, 210, 240, 270, 300,
          330, 360, 390, 420, 450, 480 ] );

    function doPHS(){ // called from html
        run_sim.run_simulation( 'phs' );
        run_sim.sim_inp_tab_to_html();
        run_sim.step_inp_tab_to_html();
        run_sim.sim_end_res_to_html();
        run_sim.sim_res_to_html();
        run_sim.step_log_tab_to_html();
        run_sim.step_log_to_graph( $( '#phs_graph' ) );
    }

    // called from html =====================================================

    function onload( wtab_id ){
        wtab.onload( wtab_id );
        phsinp.onload();
        $( '#ext_humidity' ).style.display == 'block';
        $( '#ext_Trad' ).style.display == 'block';
    }

    function par_update(this_val){
        var pid_arr = phsinp.par_update( this_val );
    }

    function toggle_visibility(id) {
       var e = $( id );
       if(e.style.display == 'block')
          e.style.display = 'none';
       else
          e.style.display = 'block';
    }

    // external interface =======================================================
    
    var self = {
        onload : onload,
        wtab_select : wtab.select,
        wtab_select_all : wtab.select_all,
        par_update : par_update,
        toggle_visibility : toggle_visibility,
        doPHS : doPHS
    };

    return self;
})(document);
