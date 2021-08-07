import { EventDispatcher, MOUSE, PerspectiveCamera, Quaternion, Spherical, TOUCH, Vector2, Vector3 } from 'three';

export class GameBoardOrbitControl extends EventDispatcher {
  camera: PerspectiveCamera;
  domElement: HTMLElement;
  target = new Vector3();

  /** Configurable parameters. See OrbitControlReadMe.md for more info on these */
  enabled = true;
  enableZoom = true;
  enableRotate = true;
  enableKeys = true;
  enableDollyAngle = true;

  EPSILON = 0.001;
  minTargetOffset = 0;
  maxTargetOffset = 100;
  minRadius = 0;
  maxRadius = Infinity;
  minTheta = -Infinity;
  maxTheta = Infinity;
  minPhi = 0;
  maxPhi = Math.PI;
  targetOffsetSpeed = 10;
  zoomSpeed = 1;
  rotateSpeed = 1;
  minRotSpeed = 0.1;
  maxRotSpeed = 0.7;
  rotSpeedCurvature = 0.1;
  dollyCurvature = 0.2;

  mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: undefined };
  touches = { ONE: TOUCH.ROTATE, TWO: undefined };

  /** Constants and Internal control flow values */
  private CONTROL_STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY: 5,
    TOUCH_DOLLY_ROTATE: 6,
  };

  private currentState = this.CONTROL_STATE.NONE;
  private changeEvent = { type: 'change' };
  private startEvent = { type: 'start' };
  private endEvent = { type: 'end' };

  /** Delta variables -> "Input parameters" for the Update() function */
  private targetOffset = 0;
  private rotateStart = new Vector2();
  private rotateEnd = new Vector2();
  private rotateDelta = new Vector2();
  private dollyStart = new Vector2();
  private dollyEnd = new Vector2();
  private dollyDelta = new Vector2();
  private sphericalDt = new Spherical();
  private scaleChange = 1;

  /** Member variables of the Update() function */
  private m: {
    camOffset: Vector3;
    camSpherical: Spherical;
    targetOffsetVec: Vector3;
    lastPosition: Vector3;
    lastQuaternion: Quaternion;
  };

  constructor(cam: PerspectiveCamera, domElement: HTMLElement) {
    super();
    this.camera = cam;
    this.domElement = domElement;
    this.bindListeners();

    /** basic initialization */
    this.m = {
      camOffset: new Vector3(),
      camSpherical: new Spherical(),
      targetOffsetVec: new Vector3(),
      lastPosition: new Vector3(),
      lastQuaternion: new Quaternion(),
    };

    /** make sure element can receive keys. */
    if (this.domElement.tabIndex === -1) {
      this.domElement.tabIndex = 0;
    }
  }

  bindListeners(): void {
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
  }

  dispose(): void {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this), false);
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this), false);
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this), false);
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this), false);
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.domElement.removeEventListener('keydown', this.onKeyDown.bind(this), false);
  }

  update(): boolean {
    /** Keep a reference to current values */
    const position = this.camera.position;
    this.m.camOffset.copy(position).sub(this.target); // cam position in relation to target (Vector3)
    this.m.camSpherical.setFromVector3(this.m.camOffset); // camOffset as spherical coordinates (Spherical)

    /** Calculate rotation speed based on distance to the center point */
    let rotSpeed = 1 - this.normalize(this.targetOffset, this.minTargetOffset, this.maxTargetOffset); // inv. normalized distance to target
    rotSpeed = this.mapCurvature(rotSpeed, this.rotSpeedCurvature); // calculate percentage speed based on distance and curvature
    rotSpeed = this.minRotSpeed + (this.maxRotSpeed - this.minRotSpeed) * rotSpeed; // apply percentage between min and max speed

    /** Apply (left/right) rotation delta */
    this.m.camSpherical.theta += this.sphericalDt.theta * rotSpeed;
    this.m.camSpherical.theta = Math.max(this.minTheta, Math.min(this.maxTheta, this.m.camSpherical.theta)); // clamp theta to min and max
    this.m.camSpherical.makeSafe(); // restrict to the fewest rotations to reach the destination
    this.m.camOffset.setFromSpherical(this.m.camSpherical); // update vector3 representation

    /** Move whole camera into 'target space' (target is now the center of the scene) */
    this.m.camOffset.sub(this.m.targetOffsetVec);
    this.m.camSpherical.setFromVector3(this.m.camOffset);

    /** In 'target space': Apply (Shrink/Grow) scale delta for camSpherical */
    this.m.camSpherical.radius *= this.scaleChange;
    this.m.camSpherical.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.m.camSpherical.radius)); // clamp to constraints

    /** In 'target space': Apply/Calculate (Up/Down) camera height delta based on distance to target */
    if (this.enableDollyAngle) {
      const dist = this.normalize(this.m.camSpherical.radius, this.minRadius, this.maxRadius); // inv. normalized distance to target
      const angleNorm = this.mapCurvature(dist, this.dollyCurvature); // calculate percentage angle based on distance and curvature
      this.m.camSpherical.phi = this.minPhi + (this.maxPhi - this.minPhi) * angleNorm; // apply percentage between min
      // and max angle
    }
    this.m.camOffset.setFromSpherical(this.m.camSpherical); // put modified vector back into offset

    /** In 'target space': Calculate targetOffsetVec (vector from 'scene center' to 'camera lookAt') */
    this.targetOffset = Math.max(this.minTargetOffset, Math.min(this.maxTargetOffset, this.targetOffset));
    this.m.targetOffsetVec = this.m.camOffset.clone();
    this.m.targetOffsetVec.y = 0;
    this.m.targetOffsetVec.normalize().multiplyScalar(this.targetOffset);

    /** Apply distance delta (Forward/Backward) and move back in world space */
    this.m.camOffset.add(this.m.targetOffsetVec);

    /** Update the actual camera position and lookAt */
    position.copy(this.target).add(this.m.camOffset);
    const tgt = this.target.clone().add(this.m.targetOffsetVec);
    this.camera.lookAt(tgt);

    /** Reset values and issue a 'changeEvent' if changes were significant */
    this.sphericalDt.set(0, 0, 0);
    this.scaleChange = 1;
    if (
      this.m.lastPosition.distanceToSquared(this.camera.position) > this.EPSILON ||
      8 * (1 - this.m.lastQuaternion.dot(this.camera.quaternion)) > this.EPSILON
    ) {
      this.dispatchEvent(this.changeEvent);

      this.m.lastPosition.copy(this.camera.position);
      this.m.lastQuaternion.copy(this.camera.quaternion);
      return true;
    }

    return false;
  }

  /**
   * Maps a curve to a (normalized) linear distance measure. This is done using a quadratic Bézier curve. The anchor points are fixed to
   * b0 := (0,0) & b2 := (1,1) while the control point b1 := (b1_x, b1_y) is calculated based on the desired curvature. The formula used
   * is a reduced form of the typical parametric representation of a quadratic Bézier curve:
   *
   *  B(t) = (b0 - 2*b1 + b2)*t² + (-2*b0 + 2*b1)*t + b0  | can be reduced to:
   *  B(t) = (1 - 2*b1)*t² + (2*b1)t                      | as long as b0 := (0,0) & b2 := (1,1)
   *
   * As t is dependent on dist (current position along the X-Achse) and the desired curvature, t needs to be calculated. The corresponding
   * t for our known x (dist) used to calculate y with B(t) can be calculated as follows:
   *
   *  dist = (1 - 2 * b1_x) * (t * t) + 2 * b1_x * t                                        | solving for t will yield
   *  t = - b1_x/(1 - 2 * b1_x) +/- sqrt( [b1_x/(1 - 2 * b1_x)]² + dist / (1 - 2 * b1_x) )  | we only want t > 0 thus -sqrt is omitted
   *  t = sqrt(b1_x² + (1 - 2 * b1_x) * dist) - b1_x / (1 - 2 * b1_x)                       | shortened version
   *
   * @param dist distance measure between 0.0 and 1.0; also input value x for B(t(x, curvature))
   * @param curvature desired curvature strength between -1.0 and 1.0
   *
   * @see "Quadratische Bézierkurven (n=2)" at https://de.wikipedia.org/wiki/B%C3%A9zierkurve
   */
  private mapCurvature(dist: number, curvature: number): number {
    /** Calculate control point b1 := (b1_x, b1_y) based on the desired curvature on f(x) = -x + 1 */
    let b1_x = 0.5 - curvature / 2;
    if (b1_x === 0.5) {
      b1_x += 0.00001;
    }
    const b1_y = 1 - b1_x;

    /** Calculate t(x, curvature) to use in B(t) later on */
    const z = 1 - 2 * b1_x;
    const t = (Math.sqrt(b1_x * b1_x + z * dist) - b1_x) / z;

    /** Calculate B(t) to get the function value y */
    return (1 - 2 * b1_y) * (t * t) + 2 * b1_y * t;
  }

  /**
   * Normalizes a measure to a value between 0.0 and 1.0 based on a min and max value
   * @param a value that is to be normalized
   * @param min minimum value 'a' can have
   * @param max maximum value 'a' can have
   */
  private normalize(a: number, min: number, max: number): number {
    return (a - min) / (max - min);
  }

  ///////////////////////////////////////////////////////////////////
  // Event listeners - set CONTROL_STATE and select event handlers //
  ///////////////////////////////////////////////////////////////////

  private onMouseDown(event): void {
    if (this.enabled === false) {
      return;
    }
    // Prevent the browser from scrolling.
    event.preventDefault();

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.
    this.domElement.focus ? this.domElement.focus() : window.focus();

    /** Map mouse button to an action */
    let mouseAction;
    switch (event.button) {
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
        mouseAction = -1;
    }

    /** Act on the action selected */
    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (this.enableZoom === false) {
          return;
        }
        this.handleMouseDownDolly(event);
        this.currentState = this.CONTROL_STATE.DOLLY;
        break;
      case MOUSE.ROTATE:
        this.handleMouseDownRotate(event);
        this.currentState = this.CONTROL_STATE.ROTATE;
        break;
      default:
        this.currentState = this.CONTROL_STATE.NONE;
    }

    /** If a state change occurred, register listeners to act on followup actions */
    if (this.currentState !== this.CONTROL_STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
      document.addEventListener('mouseup', this.onMouseUp.bind(this), false); // implicitly unbinds the Listeners afterwards
      this.dispatchEvent(this.startEvent);
    }
  }

  private onMouseMove(event): void {
    if (this.enabled === false) {
      return;
    }
    event.preventDefault();
    switch (this.currentState) {
      case this.CONTROL_STATE.ROTATE:
        if (this.enableRotate === false) {
          return;
        }
        this.handleMouseMoveRotate(event);
        break;
      case this.CONTROL_STATE.DOLLY:
        if (this.enableZoom === false) {
          return;
        }
        this.handleMouseMoveDolly(event);
        break;
    }
  }

  private onMouseUp(event): void {
    if (this.enabled === false) {
      return;
    }
    this.handleMouseUp(event);
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);

    this.dispatchEvent(this.endEvent);
    this.currentState = this.CONTROL_STATE.NONE;
  }

  private onMouseWheel(event): void {
    if (
      this.enabled === false ||
      this.enableZoom === false ||
      (this.currentState !== this.CONTROL_STATE.NONE && this.currentState !== this.CONTROL_STATE.ROTATE)
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(this.startEvent);
    this.handleMouseWheel(event);
    this.dispatchEvent(this.endEvent);
  }

  private onKeyDown(event): void {
    if (this.enabled === false || this.enableKeys === false) {
      return;
    }
    // NO-OP, this.handleKeyDown(event);
  }

  private onTouchStart(event): void {
    if (this.enabled === false) {
      return;
    }
    event.preventDefault(); // prevent scrolling
    switch (event.touches.length) {
      case 1:
        switch (this.touches.ONE) {
          case TOUCH.ROTATE:
            if (this.enableRotate === false) {
              return;
            }
            this.handleTouchStartRotate(event);
            this.currentState = this.CONTROL_STATE.TOUCH_ROTATE;
            break;
          default:
            this.currentState = this.CONTROL_STATE.NONE;
        }
        break;
      case 2:
        switch (this.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (this.enableZoom === false) {
              return;
            }
            this.handleTouchStartDolly(event);
            this.currentState = this.CONTROL_STATE.TOUCH_DOLLY;
            break;
          case TOUCH.DOLLY_ROTATE:
            if (this.enableZoom === false && this.enableRotate === false) {
              return;
            }
            this.handleTouchStartDollyRotate(event);
            this.currentState = this.CONTROL_STATE.TOUCH_DOLLY_ROTATE;
            break;
          default:
            this.currentState = this.CONTROL_STATE.NONE;
        }
        break;
      default:
        this.currentState = this.CONTROL_STATE.NONE;
    }
    if (this.currentState !== this.CONTROL_STATE.NONE) {
      this.dispatchEvent(this.startEvent);
    }
  }

  private onTouchMove(event): void {
    if (this.enabled === false) {
      return;
    }
    event.preventDefault(); // prevent scrolling
    event.stopPropagation();

    switch (this.currentState) {
      case this.CONTROL_STATE.TOUCH_ROTATE:
        if (this.enableRotate === false) {
          return;
        }
        this.handleTouchMoveRotate(event);
        this.update();
        break;
      case this.CONTROL_STATE.TOUCH_DOLLY:
        if (this.enableZoom === false) {
          return;
        }
        this.handleTouchMoveDolly(event);
        this.update();
        break;
      case this.CONTROL_STATE.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === false && this.enableRotate === false) {
          return;
        }
        this.handleTouchMoveDollyRotate(event);
        this.update();
        break;
      default:
        this.currentState = this.CONTROL_STATE.NONE;
    }
  }

  private onTouchEnd(event): void {
    if (this.enabled === false) {
      return;
    }
    this.handleTouchEnd(event);
    this.dispatchEvent(this.endEvent);
    this.currentState = this.CONTROL_STATE.NONE;
  }

  /** Disables the dropdown context Menu when right clicking the viewport */
  private onContextMenu(event): void {
    if (this.enabled === false) {
      return;
    }
    event.preventDefault();
  }

  ///////////////////////////////////////////////////////////////
  // Event handlers - update the delta variables on user input //
  ///////////////////////////////////////////////////////////////

  private handleMouseDownRotate(event: MouseEvent): void {
    this.rotateStart.set(event.clientX, event.clientY);
  }

  private handleMouseDownDolly(event: MouseEvent): void {
    this.dollyStart.set(event.clientX, event.clientY);
  }

  private handleMouseMoveRotate(event: MouseEvent): void {
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight); // yes, height
    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight);
    this.rotateStart.copy(this.rotateEnd);

    this.update();
  }

  private handleMouseMoveDolly(event: MouseEvent): void {
    this.dollyEnd.set(event.clientX, event.clientY);
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale());
    } else if (this.dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale());
    }
    this.dollyStart.copy(this.dollyEnd);

    this.update();
  }

  private handleMouseUp(event: MouseEvent): void {
    // NO-OP
  }

  private handleMouseWheel(event): void {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale());
    }

    this.update();
  }

  private handleTouchStartRotate(event): void {
    if (event.touches.length === 1) {
      this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      this.rotateStart.set(x, y);
    }
  }

  private handleTouchStartDolly(event): void {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.dollyStart.set(0, distance);
  }

  private handleTouchStartDollyRotate(event): void {
    if (this.enableZoom) {
      this.handleTouchStartDolly(event);
    }
    if (this.enableRotate) {
      this.handleTouchStartRotate(event);
    }
  }

  private handleTouchMoveRotate(event): void {
    if (event.touches.length === 1) {
      this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      this.rotateEnd.set(x, y);
    }
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight); // yes, height
    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight);
    this.rotateStart.copy(this.rotateEnd);
  }

  private handleTouchMoveDolly(event): void {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.dollyEnd.set(0, distance);
    this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));
    this.dollyOut(this.dollyDelta.y);
    this.dollyStart.copy(this.dollyEnd);
  }

  private handleTouchMoveDollyRotate(event): void {
    if (this.enableZoom) {
      this.handleTouchMoveDolly(event);
    }
    if (this.enableRotate) {
      this.handleTouchMoveRotate(event);
    }
  }

  private handleTouchEnd(event): void {
    // no-op
  }

  private getZoomScale(): number {
    return Math.pow(0.95, this.zoomSpeed);
  }

  private rotateLeft(angle: number) {
    this.sphericalDt.theta -= angle;
  }

  private rotateUp(angle: number): void {
    this.targetOffset -= this.targetOffsetSpeed * angle;
    this.targetOffset = Math.max(this.minTargetOffset, Math.min(this.maxTargetOffset, this.targetOffset));
  }

  private dollyOut(dollyScale: number): void {
    this.scaleChange /= dollyScale;
  }

  private dollyIn(dollyScale: number): void {
    this.scaleChange *= dollyScale;
  }

  getPolarAngle(): number {
    return this.m.camSpherical.phi;
  }

  getAzimuthalAngle(): number {
    return this.m.camSpherical.theta;
  }
}
