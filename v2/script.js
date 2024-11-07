import { Points, Rects, Circles, Vectors } from "ixfx/geometry.js";
import { points } from "ixfx/trackers.js";
import * as Things from "./thing.js";
import * as Util from "./util.js";

const settings = Object.freeze({
  tracker: points({ sampleLimit: 5 }),
  nrOfThings: 50,
  /** This value is used to determine the treshold
   * for the minumum number of fingers required to register
   * a gesture. All the calculations for _rect_ and 
   * _gestureStartPosition_ is based on this number.
   */
  minNumberOfFingerForGesture: 1,
})

/**
 * @typedef State
 * @property {Things.Thing[]} things
 * @property {Rects.RectPositioned | undefined} rect
 * @property {Points.Point | undefined} gestureStartPosition
 * @property {Points.Point} offsetVector
 */

/**
 * @type State
 */
let state = Object.freeze({
  things: [],
  rect: undefined,
  gestureStartPosition: undefined,
  offsetVector: { x: 0, y: 0 },
});

/**
 * This function updates values in _State_ and calls
 * other functions that update the visuals based
 * on the values in _State_. The function runs in a loop.
 */
function update() {
  use();
  requestAnimationFrame(update);
}

function use() {

  const { rect, gestureStartPosition } = state;

  if (rect === undefined || gestureStartPosition === undefined) {
    // Draw.hideRectOnScreen();
    const newThings = state.things.map((t) => {
      const { offsetVector } = state;

      const updatedPosition = /** @type Points.Point */ (Vectors.sum(t, offsetVector));

      // THIS SHOULD BE CLAMP
      const clampedPos = Points.wrap(updatedPosition);

      const finalThing = {
        ...t,
        ...clampedPos
      }

      Things.use(finalThing);
      return finalThing;
    });


    saveState({ things: newThings, offsetVector: { x: state.offsetVector.x * 0.8, y: state.offsetVector.y * 0.8 } });
    return;
  }

  // Draw.updateRectOnScreen(rect);



  const gestureCurrentPosition = { x: rect.x, y: rect.y };
  // const line = Lines.fromPoints(gestureStartPosition, gestureCurrentPosition);
  const points = [...settings.tracker.trackedByAge()];
  if (points.length > 0) {
    const offsetVector = points[0].vectorCartesian;

    const newOffset = /** @type Points.Point */ (Vectors.subtract(offsetVector, { x: offsetVector.x * 0.01, y: offsetVector.y * 0.01 }));
    console.log(newOffset);
    saveState({ offsetVector: newOffset });


    const { things } = state;
    const newThings = things.map((t) => {
      if (t.selected) {



        const updatedPosition = /** @type Points.Point*/ (Vectors.sum(t, { x: offsetVector.x * 0.7, y: offsetVector.y * 0.7 }));
        const clampedPos = Points.clamp(updatedPosition, 0, 1);

        console.log(updatedPosition);

        const finalThing = {
          ...t,
          ...clampedPos
        }

        Things.use(finalThing);

        return finalThing;
      }

      return t;
    });

    updateGestureStartPosition()
    saveState({ things: newThings });
  }
}

/**
 * Handle the 'pointerDown' event
 * @param {PointerEvent} event 
*/
async function onPointerDown(event) {
  event.preventDefault();
  const { tracker } = settings;

  await tracker.seen(event.pointerId.toString(), Util.relativePointerEvent(event));
  updateRect();
  updateGestureStartPosition();
  updateThingsSelection();
}

/**
 * Handle the 'pointermove' event
 * @param {PointerEvent} event 
*/
async function onPointerMove(event) {
  event.preventDefault();
  const { tracker } = settings;

  await tracker.seen(event.pointerId.toString(), Util.relativePointerEvent(event));
  updateRect();
}

/**
 * Handle the 'pointerUp' event
 * @param {PointerEvent} event 
 */
async function onPointerUp(event) {
  const { tracker } = settings;
  tracker.delete(event.pointerId.toString());
  updateRect();
  updateThingsSelection();
}

/**
 * Set up event listeners to track gestures and create
 * _Things_ that the users can interact with
 */
function setup() {
  // Add event listeners for 'pointerdown', 'pointermove', and 'pointerup' on the document body
  document.body.addEventListener("pointerdown", onPointerDown);
  document.body.addEventListener("pointermove", onPointerMove);
  document.body.addEventListener("pointerup", onPointerUp);

  // Create Things and save them to the state
  saveState({ things: Things.setup(settings.nrOfThings) });

  // Start the 'update' loop
  update();

  setInterval(() => {
    for (let thing of state.things) {
      // console.log(thing.selected);
    }
  }, 800);
}

/**
 * We need to assign a thing to a specific finger. In order to do this
 * we have to check the intersection between a thing and a circle created
 * around a _point_.
 */

/**
 * Checks which things are 
 * @param {Points.Point} fingerPosition 
 * @returns Things.Thing[] 
 */
function thingsSelectedByFinger(fingerPosition) {
  const { things } = state;
  let intersectingThings = [];

  things.forEach((thing) => {
    let circle = {
      ...fingerPosition,
      radius: 1,
    }
    if (Circles.isIntersecting(thing, fingerPosition)) {
      intersectingThings.push(thing);
    };
  });

  return intersectingThings;
}

/**
 * Triggers a refresh of the 'things' array
 * in order to update the ones that are currently 
 * selected.
 */
function updateThingsSelection() {
  const { things, rect } = state;

  let updatedThings = things.map((t) => {
    let selected = Things.checkIntersection(t, rect);
    return {
      ...t,
      selected
    }
  });

  saveState({ things: updatedThings });
}

/**
 * Updates the rect held in state based on the points on screen.
 * Right now the rect exists even if only one finger is on screen.
 */
function updateRect() {
  const { tracker } = settings;
  let rect;
  if (tracker.size >= settings.minNumberOfFingerForGesture) {
    const points = /** @type Array<Points.Point> */([...tracker.valuesByAge()])
    rect = Points.bbox(...points);
  } else {
    rect = undefined;
  }
  saveState({ rect });
}

/** Removes the start position if no points 
 * are being tracked anymore. Basically, 
 * delete the gestureStartPosition value
 * when less than one finger is on screen.
*/
function updateGestureStartPosition() {
  let gestureStartPosition = undefined;
  const points = /** @type Array<Points.Point> */([...settings.tracker.valuesByAge()]);

  const { rect } = state;
  if (points.length >= settings.minNumberOfFingerForGesture && rect != undefined) {
    gestureStartPosition = {
      x: rect.x,
      y: rect.y
    }

    saveState({ gestureStartPosition });
  } else {
    saveState({ gestureStartPosition: undefined });
  }
}

/**
 * Save state by merging with the current state object.
 * @param {Partial<State>} s
 */
function saveState(s) {
  // Merge the provided object 's' into the current state object and freeze it
  state = Object.freeze({
    ...state,
    ...s,
  });
}

setup();

// Guide from Clint
// force - velocity, mass, acceleration ✅
// start points , points.normalise ✅
// Give it a line, starting point, down - up 
// forces.apply - loop all things - give list of forces
// Get rid of excisting way of getting position
// calculate by using points.normalise
//forces. apply for each of the things, when you call it - same things- but new position
// Get friction aswell
// decstructured
// Look at demos
// 
// We have pointstracker - how to get vector out of point - another variable in state - inital rectangle
// when rectangle is unset - calculate vector
// decay 
// Next finger - multiple fingers -> when applying force - multiply that force by proportinal distance of finger
// use middle of rectangle as starting point
// the other way, acceleration force by finger - 
// .reset to reset point tracker - we have x y of fingers - use that
// then we get initial position per point
// tracker does all of that work
// 
// We have the forces then - when moving - do it on pointerMove
// Offset sets the last move for that finger
// If we do on PointerMove - how much data the pointer keeps - for example 5 samples
// Get values byAge, go through that
// After you calculate - set to state - in update function - take those values to forces - 
// each of those forces do a loop over those things

// Have force as an object - Id of force - associate that force with that forces - or pointerID
// Lopping over forces, apply that with proportional distance