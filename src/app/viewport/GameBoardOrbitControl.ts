import {EventDispatcher, MOUSE, PerspectiveCamera, Quaternion, Spherical, TOUCH, Vector2, Vector3} from 'three';

export class GameBoardOrbitControl extends EventDispatcher {
  constructor( cam: PerspectiveCamera, domElement: HTMLElement ) {
    super();
    this.camera = cam;
    this.domElement = domElement;
    this.updateState =  {
      offset: new Vector3(),
      quat: new Quaternion().setFromUnitVectors( this.camera.up, new Vector3(0, 1, 0)),
      quatInverse: undefined,
      lastPosition: new Vector3(),
      lastQuaternion: new Quaternion()
    };
    this.updateState.quatInverse = this.updateState.quat.clone().inverse();

    this.target0 = this.target.clone();
    this.position0 = this.camera.position.clone();
    this.zoom0 = this.camera.zoom;

    this.domElement.addEventListener( 'contextmenu', this.onContextMenu.bind(this), false );

    this.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
    this.domElement.addEventListener( 'wheel', this.onMouseWheel.bind(this), false );

    this.domElement.addEventListener( 'touchstart', this.onTouchStart.bind(this), false );
    this.domElement.addEventListener( 'touchend', this.onTouchEnd.bind(this), false );
    this.domElement.addEventListener( 'touchmove', this.onTouchMove.bind(this), false );

    this.domElement.addEventListener( 'keydown', this.onKeyDown.bind(this), false );

    // make sure element can receive keys.

    if ( this.domElement.tabIndex === - 1 ) {
      this.domElement.tabIndex = 0;
    }
  }

  camera: PerspectiveCamera;
  domElement: HTMLElement;
  target = new Vector3();
  enabled: boolean;
  minDistance = 0;
  maxDistance = Infinity;
  minPolarAngle = 0;
  maxPolarAngle = Math.PI;
  minAzimuthAngle = -Infinity;
  maxAzimuthAngle = Infinity;
  enableZoom = true;
  zoomSpeed = 1;
  enableRotate = true;
  rotateSpeed = 1;
  enablePan = true;
  panSpeed = 1;
  keyPanSpeed = 7.0;
  enableKeys = true;
  keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
  mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: undefined};
  touches = { ONE: TOUCH.ROTATE, TWO: undefined};

  // for reset
  target0: Vector3;
  position0: Vector3;
  zoom0: number;

  // privates:
  private changeEvent = { type: 'change' };
  private startEvent = { type: 'start' };
  private endEvent = { type: 'end' };
  STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };
  private state = this.STATE.NONE;
  private EPS = 0.000001;
  private spherical = new Spherical();
  private sphericalDelta = new Spherical();

  private scale = 1;
  private panOffset = new Vector3();
  private zoomChanged = false;

  private rotateStart = new Vector2();
  private rotateEnd = new Vector2();
  private rotateDelta = new Vector2();

  private panStart = new Vector2();
  private panEnd = new Vector2();
  private panDelta = new Vector2();

  private dollyStart = new Vector2();
  private dollyEnd = new Vector2();
  private dollyDelta = new Vector2();

  // functionPrivates
  private updateState: {offset: Vector3, quat: Quaternion, quatInverse: Quaternion, lastPosition: Vector3, lastQuaternion: Quaternion};
  private panLeftV = new Vector3();
  private panUpV = new Vector3();

  getPolarAngle() {
    return this.spherical.phi;
  }
  getAzimuthalAngle() {
    return this.spherical.theta;
  }
  saveState() {
    this.target0.copy(this.target);
    this.position0.copy(this.position0);
    this.zoom0 = this.camera.zoom;
  }
  reset() {
    this.target.copy(this.target0);
    this.camera.position.copy(this.position0);
    this.camera.zoom = this.zoom0;

    this.camera.updateProjectionMatrix();
    this.dispatchEvent(this.changeEvent);
    this.update();
    this.state = this.STATE.NONE;
  }
  update() {
    const position = this.camera.position;

    this.updateState.offset.copy(position).sub(this.target);
    this.updateState.offset.applyQuaternion(this.updateState.quat);

    this.spherical.setFromVector3(this.updateState.offset);

    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;

    this.spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, this.spherical.theta ) );

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this.spherical.phi ) );

    this.spherical.makeSafe();

    this.spherical.radius *= this.scale;

    // restrict radius to be between desired limits
    this.spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this.spherical.radius ) );

    this.updateState.offset.setFromSpherical(this.spherical);
    this.updateState.offset.applyQuaternion(this.updateState.quatInverse);

    this.target.add( this.panOffset );
    position.copy(this.target).add(this.updateState.offset);

    this.camera.lookAt(this.target);

    this.sphericalDelta.set(0, 0, 0);
    this.panOffset.set(0, 0, 0);
    this.scale = 1;

    if ( this.zoomChanged ||
      this.updateState.lastPosition.distanceToSquared( this.camera.position ) > this.EPS ||
      8 * ( 1 - this.updateState.lastQuaternion.dot( this.camera.quaternion ) ) > this.EPS ) {

      this.dispatchEvent( this.changeEvent );

      this.updateState.lastPosition.copy( this.camera.position );
      this.updateState.lastQuaternion.copy( this.camera.quaternion );
      this.zoomChanged = false;

      return true;

    }

    return false;
  }
  dispose() {
    this.domElement.removeEventListener( 'contextmenu', this.onContextMenu.bind(this), false );
    this.domElement.removeEventListener( 'mousedown', this.onMouseDown.bind(this), false );
    this.domElement.removeEventListener( 'wheel', this.onMouseWheel.bind(this), false );

    this.domElement.removeEventListener( 'touchstart', this.onTouchStart.bind(this), false );
    this.domElement.removeEventListener( 'touchend', this.onTouchEnd.bind(this), false );
    this.domElement.removeEventListener( 'touchmove', this.onTouchMove.bind(this), false );

    document.removeEventListener( 'mousemove', this.onMouseMove.bind(this), false );
    document.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );

    this.domElement.removeEventListener( 'keydown', this.onKeyDown.bind(this), false );

    // scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
  }

  private getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }
  private rotateLeft( angle ) {
    this.sphericalDelta.theta -= angle;
  }
  private rotateUp( angle ) {
    this.sphericalDelta.phi -= angle;
  }
  private panLeft( distance, objectMatrix ) {
    this.panLeftV.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
    this.panLeftV.multiplyScalar( - distance );

    this.panOffset.add( this.panLeftV );
  }
  private panUp( distance, objectMatrix ) {
    this.panUpV.setFromMatrixColumn( objectMatrix, 0 );
    this.panUpV.crossVectors( this.camera.up, this.panUpV );

    this.panUpV.multiplyScalar( distance );
    this.panOffset.add( this.panUpV );
  }
  // deltaX and deltaY are in pixels; right and down are positive
  private pan(deltaX, deltaY) {
    const offset = new Vector3();

    const element = this.domElement;

     // perspective
    const position = this.camera.position;
    offset.copy( position ).sub( this.target );
    let targetDistance = offset.length();

    // half of the fov is center to top of screen
    targetDistance *= Math.tan( ( this.camera.fov / 2 ) * Math.PI / 180.0 );

    // we use only clientHeight here so aspect ratio does not distort speed
    this.panLeft( 2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix );
    this.panUp( 2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix );
  }
  private dollyOut( dollyScale ) {
    this.scale /= dollyScale;
  }
  private dollyIn( dollyScale ) {
    this.scale *= dollyScale;
  }

  //
  // event callbacks - update the object state
  //

  private handleMouseDownRotate( event ) {
    this.rotateStart.set( event.clientX, event.clientY );
  }
  private handleMouseDownDolly( event ) {
    this.dollyStart.set( event.clientX, event.clientY );
  }
  private handleMouseDownPan( event ) {
    this.panStart.set( event.clientX, event.clientY );
  }
  private handleMouseMoveRotate( event ) {
    this.rotateEnd.set( event.clientX, event.clientY );
    this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.rotateSpeed );

    const element = this.domElement;

    this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height
    this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );
    this.rotateStart.copy( this.rotateEnd );

    this.update();
  }
  private handleMouseMoveDolly( event ) {
    this.dollyEnd.set( event.clientX, event.clientY );
    this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );

    if ( this.dollyDelta.y > 0 ) {
      this.dollyOut( this.getZoomScale() );
    } else if ( this.dollyDelta.y < 0 ) {
      this.dollyIn( this.getZoomScale() );
    }
    this.dollyStart.copy( this.dollyEnd );

    this.update();
  }
  private handleMouseMovePan( event ) {
    this.panEnd.set( event.clientX, event.clientY );
    this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );
    this.pan( this.panDelta.x, this.panDelta.y );

    this.panStart.copy( this.panEnd );

    this.update();

  }
  private handleMouseUp( event ) {

  }
  private handleMouseWheel( event ) {
    if ( event.deltaY < 0 ) {
      this.dollyIn( this.getZoomScale() );
    } else if ( event.deltaY > 0 ) {
      this.dollyOut( this.getZoomScale() );
    }

    this.update();
  }
  private handleKeyDown( event ) {
    let needsUpdate = false;
    switch ( event.keyCode ) {
      case this.keys.UP:
        this.pan( 0, this.keyPanSpeed );
        needsUpdate = true;
        break;
      case this.keys.BOTTOM:
        this.pan( 0, - this.keyPanSpeed );
        needsUpdate = true;
        break;
      case this.keys.LEFT:
        this.pan( this.keyPanSpeed, 0 );
        needsUpdate = true;
        break;
      case this.keys.RIGHT:
        this.pan( - this.keyPanSpeed, 0 );
        needsUpdate = true;
        break;
    }

    if ( needsUpdate ) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();
      this.update();
    }
  }
  private handleTouchStartRotate( event ) {
    if ( event.touches.length === 1 ) {
      this.rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.rotateStart.set( x, y );
    }
  }
  private handleTouchStartPan( event ) {
    if ( event.touches.length === 1 ) {
      this.panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.panStart.set( x, y );
    }
  }
  private handleTouchStartDolly( event ) {
    const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    const distance = Math.sqrt( dx * dx + dy * dy );
    this.dollyStart.set( 0, distance );
  }
  private handleTouchStartDollyPan( event ) {
    if ( this.enableZoom ) {
      this.handleTouchStartDolly( event );
    }
    if ( this.enablePan ) {
      this.handleTouchStartPan( event );
    }
  }
  private handleTouchStartDollyRotate( event ) {
    if ( this.enableZoom ) {
      this.handleTouchStartDolly( event );
    }
    if ( this.enableRotate ) {
      this.handleTouchStartRotate( event );
    }
  }
  private handleTouchMoveRotate( event ) {
    if ( event.touches.length === 1 ) {
      this.rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

      this.rotateEnd.set( x, y );
    }
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height
    this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );
    this.rotateStart.copy( this.rotateEnd );
  }
  private handleTouchMovePan( event ) {
    if ( event.touches.length === 1 ) {
      this.panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.panEnd.set( x, y );
    }
    this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );
    this.pan( this.panDelta.x, this.panDelta.y );
    this.panStart.copy( this.panEnd );
  }
  private handleTouchMoveDolly( event ) {
    const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    const distance = Math.sqrt( dx * dx + dy * dy );

    this.dollyEnd.set( 0, distance );
    this.dollyDelta.set( 0, Math.pow( this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed ) );
    this.dollyOut( this.dollyDelta.y );
    this.dollyStart.copy( this.dollyEnd );
  }
  private handleTouchMoveDollyPan( event ) {
    if ( this.enableZoom ) {
      this.handleTouchMoveDolly( event );
    }
    if ( this.enablePan ) {
      this.handleTouchMovePan( event );
    }
  }
  private handleTouchMoveDollyRotate( event ) {
    if ( this.enableZoom ) {
      this.handleTouchMoveDolly( event );
    }
    if ( this.enableRotate ) {
      this.handleTouchMoveRotate( event );
    }
  }
  private handleTouchEnd( event ) {
    // no-op
  }

  //
  // event handlers - FSM: listen for events and reset state
  //
  private onMouseDown( event ) {
    if ( this.enabled === false ) {
      return;
    }
    // Prevent the browser from scrolling.
    event.preventDefault();

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.
    this.domElement.focus ? this.domElement.focus() : window.focus();

    let mouseAction;
    switch ( event.button ) {
      case 0:
        mouseAction = this.mouseButtons.LEFT;
        break;
      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
        break;
      case 2:
        mouseAction = this.mouseButtons.RIGHT;
        break;
      default:
        mouseAction = - 1;
    }

    switch ( mouseAction ) {
      case MOUSE.DOLLY:
        if ( this.enableZoom === false ) { return; }
        this.handleMouseDownDolly( event );
        this.state = this.STATE.DOLLY;
        break;
      case MOUSE.ROTATE:
        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
          if ( this.enablePan === false ) { return; }
          this.handleMouseDownPan( event );
          this.state = this.STATE.PAN;
        } else {
          if ( this.enableRotate === false ) { return; }
          this.handleMouseDownRotate( event );
          this.state = this.STATE.ROTATE;
        }
        break;
      case MOUSE.PAN:
        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
          if ( this.enableRotate === false ) { return; }
          this.handleMouseDownRotate( event );
          this.state = this.STATE.ROTATE;
        } else {
          if ( this.enablePan === false ) { return; }
          this.handleMouseDownPan( event );
          this.state = this.STATE.PAN;
        }
        break;
      default:
        this.state = this.STATE.NONE;
    }

    if ( this.state !== this.STATE.NONE ) {
      document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
      document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
      this.dispatchEvent( this.startEvent );
    }
  }
  private onMouseMove( event ) {
    if ( this.enabled === false ) {
      return;
    }
    event.preventDefault();
    switch ( this.state ) {
      case this.STATE.ROTATE:
        if ( this.enableRotate === false ) {
          return;
        }
        this.handleMouseMoveRotate( event );
        break;
      case this.STATE.DOLLY:
        if ( this.enableZoom === false ) {
          return;
        }
        this.handleMouseMoveDolly( event );
        break;
      case this.STATE.PAN:
        if ( this.enablePan === false ) {
          return;
        }
        this.handleMouseMovePan( event );
        break;
    }
  }
  private onMouseUp( event ) {
    if ( this.enabled === false ) {
      return;
    }
    this.handleMouseUp( event );
    document.removeEventListener( 'mousemove', this.onMouseMove.bind(this), false );
    document.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );

    this.dispatchEvent( this.endEvent );
    this.state = this.STATE.NONE;
  }
  private onMouseWheel( event ) {
    if ( this.enabled === false || this.enableZoom === false || ( this.state !== this.STATE.NONE && this.state !== this.STATE.ROTATE ) ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent( this.startEvent );
    this.handleMouseWheel( event );
    this.dispatchEvent( this.endEvent );
  }
  private onKeyDown( event ) {
    if ( this.enabled === false || this.enableKeys === false || this.enablePan === false ) {
      return;
    }
    this.handleKeyDown( event );
  }
  private onTouchStart( event ) {
    if ( this.enabled === false ) {
      return;
    }
    event.preventDefault(); // prevent scrolling
    switch ( event.touches.length ) {
      case 1:
        switch ( this.touches.ONE ) {
          case TOUCH.ROTATE:
            if ( this.enableRotate === false ) {
              return;
            }
            this.handleTouchStartRotate( event );
            this.state = this.STATE.TOUCH_ROTATE;
            break;
          case TOUCH.PAN:
            if ( this.enablePan === false ) {
              return;
            }
            this.handleTouchStartPan( event );
            this.state = this.STATE.TOUCH_PAN;
            break;
          default:
            this.state = this.STATE.NONE;
        }
        break;
      case 2:
        switch ( this.touches.TWO ) {
          case TOUCH.DOLLY_PAN:
            if ( this.enableZoom === false && this.enablePan === false ) {
              return;
            }
            this.handleTouchStartDollyPan( event );
            this.state = this.STATE.TOUCH_DOLLY_PAN;
            break;
          case TOUCH.DOLLY_ROTATE:
            if ( this.enableZoom === false && this.enableRotate === false ) {
              return;
            }
            this.handleTouchStartDollyRotate( event );
            this.state = this.STATE.TOUCH_DOLLY_ROTATE;
            break;
          default:
            this.state = this.STATE.NONE;
        }
        break;
      default:
        this.state = this.STATE.NONE;
    }
    if ( this.state !== this.STATE.NONE ) {
      this.dispatchEvent( this.startEvent );
    }
  }
  private onTouchMove( event ) {
    if ( this.enabled === false ) {
      return;
    }
    event.preventDefault(); // prevent scrolling
    event.stopPropagation();

    switch ( this.state ) {
      case this.STATE.TOUCH_ROTATE:
        if ( this.enableRotate === false ) {
          return;
        }
        this.handleTouchMoveRotate( event );
        this.update();
        break;
      case this.STATE.TOUCH_PAN:
        if ( this.enablePan === false ) {
          return;
        }
        this.handleTouchMovePan( event );
        this.update();
        break;
      case this.STATE.TOUCH_DOLLY_PAN:
        if ( this.enableZoom === false && this.enablePan === false ) {
          return;
        }
        this.handleTouchMoveDollyPan( event );
        this.update();
        break;
      case this.STATE.TOUCH_DOLLY_ROTATE:
        if ( this.enableZoom === false && this.enableRotate === false ) {
          return;
        }
        this.handleTouchMoveDollyRotate( event );
        this.update();
        break;
      default:
        this.state = this.STATE.NONE;
    }
  }
  private onTouchEnd( event ) {
    if ( this.enabled === false ) {
      return;
    }
    this.handleTouchEnd( event );
    this.dispatchEvent( this.endEvent );
    this.state = this.STATE.NONE;
  }
  private onContextMenu( event ) {
    if ( this.enabled === false ) {
      return;
    }
    event.preventDefault();
  }

}
