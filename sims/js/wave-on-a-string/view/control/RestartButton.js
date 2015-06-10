// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control Restart button view
 *
 * @author Anton Ulyanov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // strings
  var restartString = require( 'string!WAVE_ON_A_STRING/restart' );

  function RestartButton( model, options ) {
    TextPushButton.call( this, restartString, {
      listener: model.manualRestart.bind( model ),
      font: new PhetFont( 12 ),
      baseColor: 'hsl(210,0%,85%)'
    } );
    this.mutate( options );
    this.touchArea = this.localBounds.dilatedXY( 5, 20 );
  }

  inherit( TextPushButton, RestartButton );

  return RestartButton;
} );
