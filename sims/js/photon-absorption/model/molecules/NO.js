// Copyright 2002-2014, University of Colorado

/**
 * Class that represents NO ( nitrogen monoxide ) in the model.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Molecule = require( 'MOLECULES_AND_LIGHT/photon-absorption/model/Molecule' );
  var AtomicBond = require( 'MOLECULES_AND_LIGHT/photon-absorption/model/atoms/AtomicBond' );
  var Atom = require( 'MOLECULES_AND_LIGHT/photon-absorption/model/atoms/Atom' );

  // Model Data for the nitrogen monoxide molecule.
  var INITIAL_NITROGEN_OXYGEN_DISTANCE = 170; // In picometers.

  /**
   * Constructor for a nitrogen monoxide molecule.
   *
   * @param {Object} options
   * @constructor
   */
  function NO( options ) {

    // Supertype constructor
    Molecule.call( this, options );

    // Instance Data
    this.nitrogenAtom = Atom.nitrogen();
    this.oxygenAtom = Atom.oxygen();

    // Configure the base class.
    this.addAtom( this.nitrogenAtom );
    this.addAtom( this.oxygenAtom );
    this.addAtomicBond( new AtomicBond( this.nitrogenAtom, this.oxygenAtom, { bondCount: 2 } ) );

    // Set up the photon wavelengths to absorb.

    // Set the initial offsets.
    this.initializeAtomOffsets();

  }

  return inherit( Molecule, NO, {

    /**
     * Initialize and set the COG positions for each atom which compose this NO molecule.
     */
    initializeAtomOffsets: function() {

      this.addInitialAtomCogOffset( this.nitrogenAtom, new Vector2( -INITIAL_NITROGEN_OXYGEN_DISTANCE / 2, 0 ) );
      this.addInitialAtomCogOffset( this.oxygenAtom, new Vector2( INITIAL_NITROGEN_OXYGEN_DISTANCE / 2, 0 ) );
      this.updateAtomPositions();

    }

  } );
} );


