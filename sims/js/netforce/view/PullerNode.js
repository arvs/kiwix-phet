// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the graphic for the puller, which can be dragged from the toolbox to the rope to apply force.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Input = require( 'SCENERY/input/Input' );

  /**
   * Create a PullerNode for the specified puller
   * @param {Puller} puller
   * @param {NetForceModel} model
   * @param {Image} image image of the puller standing upright
   * @param {Image} pullImage image of the puller exerting a force
   * @constructor
   */
  function PullerNode( puller, model, image, pullImage, options ) {
    this.puller = puller;
    var pullerNode = this;
    this.puller.node = this;//Wire up so node can be looked up by model element.
    var x = puller.position.x;
    var y = puller.position.y;

    Image.call( this, image, {
      x: x,
      y: y,
      cursor: 'pointer',
      scale: 0.86,
      focusable: puller.focusable,
      textDescription: puller.textDescription
    } );

    puller.focusableProperty.link( function( focusable ) {
      pullerNode.focusable = focusable;
    } );
    puller.textDescriptionProperty.link( function( textDescription ) {
      pullerNode.textDescription = textDescription;
    } );

    var updateLocation = function() {
      var knotted = puller.knot;
      var pulling = model.started && knotted;
      if ( knotted ) {
        var pullingOffset = pulling ? -puller.dragOffsetX : puller.standOffsetX;
        var blueOffset = pullerNode.puller.type === 'blue' ? -60 + 10 : 0;
        pullerNode.setTranslation( puller.knot.x + pullingOffset + blueOffset, puller.knot.y - pullerNode.height + 90 );
      }
      else {
        pullerNode.setTranslation( puller.position );
      }
    };

    model.on( 'reset-all', updateLocation );

    model.startedProperty.link( updateLocation );
    puller.positionProperty.link( updateLocation );

    puller.hoverKnotProperty.link( function( hoverKnot ) {
      if ( hoverKnot ) {
        var pullingOffset = false ? -puller.dragOffsetX : puller.standOffsetX;
        var blueOffset = pullerNode.puller.type === 'blue' ? -60 + 10 + pullerNode.width / 2 : -pullerNode.width / 2;
        pullerNode.setTranslation( hoverKnot.x + pullingOffset + blueOffset, hoverKnot.y - pullerNode.height + 90 - 120 );
      }
    } );

    var updateImage = function() {
      var knotted = puller.knot;
      var pulling = model.started && knotted;
      pullerNode.image = pulling ? pullImage : image;

      //Reshape the focus rect when image changes
      //This was copied from updateLocation above to solve https://github.com/phetsims/forces-and-motion-basics/issues/55
      if ( knotted ) {
        var pullingOffset = pulling ? -puller.dragOffsetX : puller.standOffsetX;
        var blueOffset = pullerNode.puller.type === 'blue' ? -60 + 10 : 0;
        pullerNode.setTranslation( puller.knot.x + pullingOffset + blueOffset, puller.knot.y - pullerNode.height + 90 );
      }
      else {
        pullerNode.setTranslation( puller.position );
      }
    };
    model.startedProperty.link( updateImage );
    model.runningProperty.link( updateImage );

    pullerNode.addInputListener( new SimpleDragHandler(
      {
        allowTouchSnag: true,
        start: function() {
          var knot = puller.knot;
          puller.disconnect();
          puller.dragging = true;
          pullerNode.moveToFront();
          puller.trigger( 'dragged' );
          updateImage();

          //Hack around the puller position, which seems to be broken for blue pullers for unknown reasons
          if ( knot && puller.type === 'blue' ) {
            puller.position = puller.position.plusXY(
              puller.size === 'small' ? -50 :
              puller.size === 'medium' ? -30 :
              -40,
              puller.size === 'small' ? -30 :
              puller.size === 'medium' ? -90 :
              -140 );
          }
          updateLocation();
        },
        end: function() {
          updateLocation();
          puller.dragging = false;
          puller.trigger( 'dropped' );
          updateImage();
        },
        translate: function( event ) {
          pullerNode.puller.position = event.position;
        }
      } ) );

    this.addInputListener( {
      keydown: function( event, trail ) {
        var keyCode = event.domEvent.keyCode;
        var focusContext = null;
        if ( keyCode === Input.KEY_ENTER || keyCode === Input.KEY_SPACE ) {
          if ( puller.knot ) {
            puller.disconnect();
            puller.positionProperty.reset();
            model.numberPullersAttached = model.countAttachedPullers();
            updateImage();
            updateLocation();
          }
          else {
            var knot = model.getClosestOpenKnotFromCart( puller );
            puller.setValues( { position: new Vector2( knot.x, knot.y ) } );
            model.numberPullersAttached = model.countAttachedPullers();
            puller.dragging = false;
            puller.trigger( 'dropped' );
            updateImage();
            updateLocation();
          }
        }
        else if ( keyCode === Input.KEY_LEFT_ARROW || keyCode === Input.KEY_RIGHT_ARROW ) {

          // Move to an adjacent open knot.
          var delta = (keyCode === Input.KEY_LEFT_ARROW) ? -1 : +1;

          if ( puller.knot !== null ) {
            model.movePullerToAdjacentOpenKnot( puller, delta );
          }
        }
        else if ( keyCode === Input.KEY_ESCAPE ) {
          focusContext = Input.focusContexts[ Input.focusContexts.length - 1 ];
          Input.popFocusContext( focusContext );

          model.pullers.forEach( function( puller ) {
            puller.focusable = false;
          } );
        }
        else if ( keyCode === Input.KEY_TAB ) {

          // This tremendous hack is necessary because elements get a tab event when they *receive* focus
          // for the first time.  When that bug in Input.js is fixed, then this will be buggy.
          // The desired behavior is for the focus to leave the group after tabbing through all pullers.
          if ( puller.size === 'small' && !puller.other ) {
            var shiftPressed = Input.pressedKeys.indexOf( Input.KEY_SHIFT ) >= 0;
            if ( !shiftPressed ) {
              focusContext = Input.focusContexts[ Input.focusContexts.length - 1 ];
              Input.popFocusContext( focusContext );

              model.pullers.forEach( function( puller ) {
                puller.focusable = false;
              } );

              Input.moveFocus( +1 );
            }
          }
        }
      }
    } );

    this.mutate( options );
  }

  return inherit( Image, PullerNode );
} );