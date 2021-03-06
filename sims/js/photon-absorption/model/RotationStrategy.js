// Copyright 2002-2014, University of Colorado

/**
 * Photon absorption strategy that causes a molecule to rotate after absorbing a photon, and re-emit the photon after
 * some length of time.  This is to be inherited by the general PhotonAbsorptionStrategy class.
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PhotonHoldStrategy = require( 'MOLECULES_AND_LIGHT/photon-absorption/model/PhotonHoldStrategy' );

  //Random boolean generator.
  var RAND = {
    nextBoolean: function() {
      return Math.random() < 0.50;
    }
  };

  /**
   * Constructor for a rotation strategy.
   *
   * @param {Molecule} molecule - The molecule which will use this strategy.
   * @constructor
   */
  function RotationStrategy( molecule ) {

    // Supertype constructor
    PhotonHoldStrategy.call( this, molecule );

  }

  return inherit( PhotonHoldStrategy, RotationStrategy, {

    /**
     * Handle when a photon is absorbed.  Set the molecule to a rotating state
     * and set the direction of rotation to a random direction.
     */
    photonAbsorbed: function() {

      this.molecule.rotationDirectionClockwise = RAND.nextBoolean();
      this.molecule.rotating = true;

    },

    /**
     * Re-emit the absorbed photon.  Set the molecule to a non-rotating state.
     */
    reemitPhoton: function() {

      PhotonHoldStrategy.prototype.reemitPhoton.call( this );
      this.molecule.rotating = false;

    }

  } );
} );


