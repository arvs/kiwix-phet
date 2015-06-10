// Copyright 2002-2013, University of Colorado Boulder

/**
 * Solution shown in a beaker.
 * Assumes that the beaker is represented as a cylinder, with elliptical top and bottom.
 * Origin is at the upper-left corner of this cylinder.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );

  // constants
  var DEBUG_ORIGIN = false;

  function SolutionNode( cylinderSize, cylinderEndHeight, solution, maxVolume ) {

    var thisNode = this;
    Node.call( thisNode, { pickable: false } );

    var middleNode = new Rectangle( 0, 0, 1, 1 ); // middle shape will change with volume
    var endShape = Shape.ellipse( cylinderSize.width / 2, 0, cylinderSize.width / 2, cylinderEndHeight / 2 );
    var topNode = new Path( endShape, { lineWidth: 0.5, stroke: new Color( 0, 0, 0, 85 ) } );
    var bottomNode = new Path( endShape );

    thisNode.addChild( bottomNode );
    thisNode.addChild( middleNode );
    thisNode.addChild( topNode );
    if ( DEBUG_ORIGIN ) {
      thisNode.addChild( new Circle( { radius: 3, fill: 'red' } ) );
    }

    // sync with model
    var updateColor = function() {
      var color = solution.getColor();
      topNode.fill = color;
      middleNode.fill = color;
      bottomNode.fill = color;
    };
    solution.concentrationProperty.link( updateColor );
    solution.soluteProperty.link( updateColor );

    var updateShape = function() {
      var height = Util.linear( 0, maxVolume, 0, cylinderSize.height, solution.volume );
      topNode.visible = bottomNode.visible = middleNode.visible = ( height > 0 );
      if ( height > 0 ) {
        middleNode.setRect( 0, cylinderSize.height - height, cylinderSize.width, height );
        topNode.y = cylinderSize.height - height;
        bottomNode.y = cylinderSize.height;
      }
    };
    solution.volumeProperty.link( updateShape );
  }

  return inherit( Node, SolutionNode );
} );