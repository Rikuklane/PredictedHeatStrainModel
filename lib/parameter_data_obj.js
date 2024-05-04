// Copyright 2014 Bo Johansson. All rights reserved
// Mail: bo(stop)johansson(at)lsn(stop)se

"use strict;";

var boj = boj || {};

boj.par_data_object = ( function () {

    function extend(Child, Parent) {
        Child.prototype = inherit(Parent.prototype);
        Child.prototype.constructor = Child;
        Child.o_parent = Parent.prototype;
    }

    function inherit(proto) {
        function F() {}
        F.prototype = proto;
        return new F;
    }

    // Parameter object ====================================================================

    function Par_any( pid ){
        this.pid = pid;
        //this.func_get func_get( ) => stored val
        //this.func_set func_set( requeste val ) => stored val
    }

    var Par_constr_type = { 'int' : Par_int, 'float' : Par_float, string : Par_string, bool : Par_bool };
    
    function new_parameter( type, pid ){
        var constr = Par_constr_type[type];
        return constr && new constr( pid );
    }

    var par_config_option_id = [ 'dec_nof', 'def_val', 'descr', 'min', 'max', 'output', 'symbol', 'unit' ];

    Par_any.prototype.config = 
        function( config_obj ){
            var self = this;
            if ( config_obj ){
                par_config_option_id.map(
                    function( id ){
                        if ( id in config_obj ){
                            self[ id ] = config_obj[ id ];
                        }
                    }
                );
            }
        };
    
    Par_any.prototype.config_func_get_set =
        function( func_get, func_set ){
            this.func_get = func_get;
            this.func_set = func_set;
        };

    Par_any.prototype.get_info =
        function(){
            var res = { pid : this.pid, type : this.constructor.name };
            var self = this;
            par_config_option_id.map(
                function( id ){
                    if ( self[ id ] !== undefined ){
                        res[ id ] = self[ id ];
                    }
                }
            );
            return res;
    };
    
    Par_any.prototype.set_default =
        function(){
            if ( 'def_val' in this ){
                this.set( this.def_val );
            }
            return this.func_get();
        };
    
    Par_any.prototype.get =
        function(){
            return this.func_get();
        };

    // debug par set -------------------------------------------------------------------

    var par_debug_do = true;

    var count = 0;
    function par_count( parins, val ){
        count++; // set breakpoint here
    }

    function par_debug( parins, val ){
        if ( parins.pid === 'sim_mod' ){
            par_count( parins, val );
            //alert( parins.pid + ' =<' + val + '>' );
        }
    }

    // Par_int -------------------------------------------------------------------------

    function Par_int( /* pid */ ){ // constructor
        Par_any.apply(this, arguments);
    }
    
    extend(Par_int, Par_any);

    Par_int.prototype.set =
        function( val ){
            if ( typeof val === 'string' ) {
                val = parseInt( val, 10 );
            }
            if ( ! (typeof val === 'number') ){
                val = NaN; }
            if ( 'min' in this){
                var min = this.min;
                if ( val < min ){ val = min; }
            }
            if ( 'max' in this){
                var max = this.max;
                if ( val > max ){ val = max; }
            }
            if ( par_debug_do ){ par_debug( this, val ); }
            this.func_set( val );
            return this.func_get();
        };

    Par_int.prototype.as_string =
        function(){
            var val = this.func_get();
            if ( val === undefined ){
                return '?';
            }
            else {
                return val.toFixed( 0 );
            }
        };

    Par_int.prototype.as_csv =
        function(){
            var val = this.func_get();
            return val.toFixed( 0 );
        };
        
    // Par_float -------------------------------------------------------------------------

    function Par_float( /* pid */ ){ // constructor
        Par_any.apply(this, arguments);
    }
    
    extend(Par_float, Par_any);

    Par_float.prototype.set =
        function( val ){
            if ( typeof val === 'string' ) {
                val = parseFloat( val );
            }
            if ( ! (typeof( val ) === 'number') ){
                val = NaN; }
            if ( 'min' in this){
                var min = this.min;
                if ( val < min ){ val = min; }
            }
            if ( 'max' in this){
                var max = this.max;
                if ( val > max ){ val = max; }
            }
            if ( par_debug_do ){ par_debug( this, val ); }
            this.func_set( val );
            return this.func_get();
        };

    Par_float.prototype.as_string =
        function(){
            var val = this.func_get();
            if ( val == undefined ){
                return '?';
            }
            var dec_nof = this.dec_nof;
            if ( dec_nof === undefined ){
                var int_nof = val.toFixed(  0 ).length;
                dec_nof = 3 - int_nof;
                dec_nof = dec_nof <= 0 ? 0 : dec_nof;
            }
            var str = val.toFixed( dec_nof );
            return str;
        };

    Par_float.prototype.as_csv =
        function(){
            var str = this.as_string();
            return str;
        };


    // Par_string -------------------------------------------------------------------------

    function Par_string( /* pid */ ){ // constructor
        Par_any.apply(this, arguments);
    }
    
    extend(Par_string, Par_any);

    Par_string.prototype.set =
        function( val ){
            val = val.toString();
            if ( par_debug_do ){ par_debug( this, val ); }
            this.func_set( val );
            return this.func_get();
        };

    Par_string.prototype.as_string =
        function(){
            return this.func_get();
        };

    Par_string.prototype.as_csv =
        function(){
            var str = this.func_get();
            return string_as_csv( str );
        };

    // Par_bool -------------------------------------------------------------------------

    function Par_bool( /* pid */ ){ // constructor
        Par_any.apply(this, arguments);
    }
    
    extend(Par_bool, Par_any);

    Par_bool.prototype.set =
        function( val ){
            val = ! ! val;
            if ( par_debug_do ){ par_debug( this, val ); }
            this.func_set( val );
            return this.func_get();
        };

    Par_bool.prototype.as_string =
        function(){
            return this.func_get() ? 'true' : 'false';
        };

    Par_bool.prototype.as_csv =
        function(){
            return this.func_get() ? 'true' : 'false';
        };

    // Group of parameter object ==============================================================

    function Par_anygrp( id ){
        this.id = id; // for debug
        this.parins_obj = {}; // { pid : Par_*_obj, ... }
        this.pid_arr = []; // [ pid, ... ]
    }

    Par_anygrp.prototype.pid_all =
        function(){
            return this.pid_arr;
        };

    // access one parameter instance ---------------------------------------------------------
    
    Par_anygrp.prototype.is_pid =
        function( pid ){
            return ! ! this.parins_obj[ pid ];
        };

    Par_anygrp.prototype.parins_pid = // parameter instance
        function( pid ){
            return this.parins_obj[ pid ];
        };

    Par_anygrp.prototype.set_default_pid =
        function( pid ){
            var parins = this.parins_obj[ pid ];
            return parins && parins.set_default();
        };

    Par_anygrp.prototype.get_pid =
        function( pid ){
            var parins = this.parins_obj[ pid ];
            return parins && parins.get();
        };

    Par_anygrp.prototype.set_pid =
        function( pid, val ){
            var parins = this.parins_obj[ pid ];
            return parins && parins.set( val );
        };

    // access all parameter instances ---------------------------------------------------------

    Par_anygrp.prototype.set_default_all =
        function (){
            var parins_obj = this.parins_obj;
            for ( var pid in parins_obj ){
                parins_obj[ pid ].set_default();
            }
    };

    Par_anygrp.prototype.map_id =
        function ( func ){
            var pid_arr = this.pid_all();
            pid_arr.map( function( pid ){ func( pid ); });
        };

    // create parameter references object ------------------------------------------------------

    Par_anygrp.prototype.new_parref =
        function( /* Par_anygrp, ... */ ){
            var arg = Array.prototype.slice.call(arguments);
            var parref = new Par_ref( );
            parref.add_group.apply( parref, [ this ].concat( arg ) );
            return parref;
        };

    // Swarm of parameter object ================================================================
    // values NOT stored locally in the swarm
    
    function Par_swarm( id ){
        Par_swarm.o_parent.constructor.apply(this, arguments);
    }
    
    extend(Par_swarm, Par_anygrp);

    function new_par_swarm( id ){
        return new Par_swarm( id );
    }

    // par_spec = [ s, ... ]
    // s = [ 'pid', 'type', option ]
    // option = { option_id, val }, option_id see par_config_option_id

    Par_swarm.prototype.create_parameter =
        function(  par_spec ){
            var self = this;
            par_spec.map(
                function( s ){
                    var type = s[ 1 ];
                    var pid = s[ 0 ];
                    var par = new_parameter( type, pid );
                    if ( ! par ){
                        alert ( 'ERROR Par_swarm.create_parameter type: ' + type + ' pid: ' + pid );
                    }
                    else{
                        par.config_func_get_set( s[ 2 ], s[ 3 ] );
                        par.config( s[ 4 ] );
                        self.parins_obj[ pid ] = par;
                        self.pid_arr.push( pid );
                    }
                }
            );
            return this;
        };

    // Par_store of parameter object --------------------------------------------------------------
    // values stored locally in the store in an object
    
    function Par_store(){
        this.val_obj = {};
        Par_store.o_parent.constructor.apply(this, arguments);
    }
    
    extend(Par_store, Par_anygrp);

    function new_par_store( id ){
        return new Par_store( id );
    }

    Par_store.prototype.store_obj =
        function(){
            return this.val_obj;
        };

    // par_spec = [ s, ... ]
    // s = [ 'pid', 'type', option ]
    // option = { option_id, val }, option_id see par_config_option_id

    Par_store.prototype.create_parameter =
        function(  par_spec ){
            var self = this;
            par_spec.map(
                function( s ){
                    var type = s[ 1 ];
                    var pid = s[ 0 ];
                    var par = new_parameter( type, pid );
                    if ( ! par ){
                        alert ( 'ERROR Par_store.create_parameter type: ' + type + ' pid: ' + pid );
                    }
                    else
                    {
                        par.config_func_get_set(
                            function(){
                                return self.val_obj[ pid ];
                            },
                            function( val ){
                                self.val_obj[ pid ] = val;
                            }
                        );
                        par.config( s[ 2 ] );
                        self.parins_obj[ pid ] = par;
                        self.pid_arr.push( pid );
                    }
                }
            );
            return this;
        };

    // Par_ref refernces to parmeter instances =======================================

    function Par_ref(){
        this.parins_obj = {};
    }

    function new_par_ref(){
        return new Par_ref();
    }

    Par_ref.prototype.add_group =
        function( Par_anygrp /*, ... */ ){
            var res = {};
            var arg = Array.prototype.slice.call(arguments);
            var par_ref = this;
            arg.map(
                function( par_anygrp ){
                    var pid_arr = par_anygrp.pid_all();
                    pid_arr.map(
                        function( pid ){
                            par_ref.parins_obj[ pid ] = par_anygrp.parins_obj[ pid ];
                        }
                    );
                }
            );
            return res;
        };

    Par_ref.prototype.pid_all =
        function(){
            return Object.keys( this.parins_obj);
        };

    // access one parameter instance ---------------------------------------------------------

    Par_ref.prototype.is_pid = Par_anygrp.prototype.is_pid;

    Par_ref.prototype.parins_pid =
    Par_anygrp.prototype.parins_pid;

    Par_ref.prototype.set_default_pid = Par_anygrp.prototype.set_default_pid;

    Par_ref.prototype.get_pid = Par_anygrp.prototype.get_pid;

    Par_ref.prototype.set_pid = Par_anygrp.prototype.set_pid;

    // access all parameter instances ---------------------------------------------------------
    
    Par_ref.prototype.set_default_all = Par_anygrp.prototype.set_default_all;

    Par_ref.prototype.map_id = Par_anygrp.prototype.map_id;

    // parameter instance access functions

    Par_ref.prototype.get_value_func =
        function(){
            var par_ref = this;
            return function( pid ){
                var parins = par_ref.parins_obj[ pid ];
                return parins && parins.get();
            };
        };

        Par_ref.prototype.set_value_func =
        function(){
            var par_ref = this;
            return function( pid, val ){
                var parins = par_ref.parins_obj[ pid ];
                return parins && parins.set( val );
            };
        };

    Par_ref.prototype.par_access_func =
        function(){
            var par_ref = this;
            return function( pid /*, val */ ){
                var parins = par_ref.parins_obj[ pid ];
                if ( ! parins ){
                    return undefined;
                }
                else if ( arguments.length === 1 ){ // only pid
                    return parins.get();
                }
                else {
                    return parins.set( arguments[ 1 ] );
                }
            };
        };

    // csv util =============================================================

    // If a string has leading or trailing space,
    // contains a comma double quote or a newline
    // it needs to be quoted in CSV output
    var rx_need_quoting = /^\s|\s$|,|"|\n/;

    function string_as_csv( str ){
        str = str.replace(/"/g, '""');
        if ( rx_need_quoting.test( str ) ){
            str = '"' + str + '"';
        }
        else if ( str === '' ){
            str = '""';
        }
        return str;
    }

    // parameter spec utility ============================================

    function par_spec_modify( src, mod_spec, prefix ){
        var res = [].concat( src.slice(0) ); // shallow copy
        var idx_from_id = {};
        res.map(
            function( ce, idx ){
                var id = ce[ 0 ];
                idx_from_id[ id ] = idx;
            }
        );
        mod_spec.map(
            function( ce ){
                var pid = ce[ 0 ];
                var modify = ce[ 1 ];
                var idx = idx_from_id[ pid ];
                var spec = res[ idx ].slice(0); // shallow copy
                var option_src = spec[ 2 ];
                var option = {};
                for ( var prop in option_src ){
                    option[ prop ] = option_src[ prop ];
                }
                for ( prop in modify ){
                    option[ prop ] = modify[ prop ];
                }
                spec[ 2 ] = option;
                res[ idx ] = spec;
            }
        );
        if ( prefix ){
            res.map(
                function( ce ){
                    var pid = ce[ 0 ];
                    ce[ 0 ] = prefix + pid;
                }
            );
        }
        return res;
    }
        
    // Reveal public pointers to 
    // private functions and properties
    return{
        new_par_store : new_par_store,
        new_par_swarm : new_par_swarm,
        util : {
            string_as_csv : string_as_csv,
            par_spec_modify : par_spec_modify
        }
    };
})();
