/**
 * @author dmarcos / http://github.com/dmarcos
 *
 * This controls allow to change the orientation of the camera using the mouse
 */

THREE.DocumentControl = function ( object, domElement, $ionicGesture ) {

  var scope = this;
  var PI_2 = Math.PI / 2;

  var object = object;
  var yVector = new THREE.Vector3( 1, 0, 0 );

  var dragOnGoing = false;

  var onDragUpDown = function ( event ) {
    if ( scope.enabled === false ) return;

    console.log("dragUpDown detected", event);
    console.log("dragUpDown:event", Object.keys(event));

    var deltaYNegative = event.gesture.deltaY < 0;
    var deltaY = Math.pow(Math.abs(event.gesture.deltaY), 1.15);
    if(deltaYNegative) {
      deltaY *= -1;
    }

    scope.orientation.yPower = deltaY * 0.04;
    scope.dragOnGoing = true;
    event.stopPropagation();
    return true;
  };

  var onDragEnd = function ( event ) {
    if ( scope.enabled === false ) return;

    console.log("dragEnd detected", event);
    console.log("dragEnd:event", Object.keys(event));

    scope.dragOnGoing = false;

    event.stopPropagation();
    return true;
  };

  scope.enabled = true;
  scope.orientation = {
    yPower: 0
  };

  this.update = function() {
    var needRendering = false;

    if(scope.enabled === false) return false;

    if(scope.orientation.yPower != 0) {
      // we need a new image after this round
      needRendering = true;

      // reduce speed each round
      scope.orientation.yPower *= 0.98;

      // bring it to stop after it falls below a certain amount of power.
      if(Math.abs(scope.orientation.yPower) <= 0.03125) {
        scope.orientation.yPower = 0;
      }
    }

    var old = object.position.z;
    object.translateZ(scope.orientation.yPower);

    if(object.position.z != old) {
      console.log("Updating object.position.z to " + object.position.z + " with a dY=" + scope.orientation.yPower);
    }

    //mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y );
    // mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y );
    //object.position.y = mouseQuat.y
    return needRendering;
  };


  var dragDownGesture;
  scope.dispose = function() {
    $ionicGesture.off(dragDownGesture, 'dragdown', onDragUpDown);
    $ionicGesture.off(dragUpGesture, 'dragup', onDragUpDown);
    $ionicGesture.off(dragEndGesture, 'dragend', onDragEnd);
  }

  dragDownGesture = $ionicGesture.on('dragdown', onDragUpDown, [domElement], {});
  dragUpGesture = $ionicGesture.on('dragup', onDragUpDown, [domElement], {});
  dragEndGesture = $ionicGesture.on('dragend', onDragEnd, [domElement], {});
};
