import { Points, Rects, Lines, Vectors } from 'ixfx/geometry.js';

/**
 * Position an element from its middle
 * @param {HTMLElement} element 
 * @param {Points.Point} relativePos 
 */
export const positionFromMiddle = (element, relativePos) => {
  if (!element) throw new Error(`Element undefined`);

  // Convert relative to absolute units
  const absPosition = Points.multiply(relativePos, window.innerWidth, window.innerHeight);

  const thingRect = element.getBoundingClientRect();
  const offsetPos = Points.subtract(absPosition, thingRect.width / 2, thingRect.height / 2);

  // Apply via CSS
  element.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`;
};

/**
 * Make `x` and `y` relative with respect to window dimensions
 * @param {number} x
 * @param {number} y
 * @returns {{x:number,y:number}}  
 */
export const relativePoint = (x, y) => {
  return {
    x: x / window.innerWidth,
    y: y / window.innerHeight
  };
};

/**
 * 
 * @param {Rects.RectPositioned | undefined} rect 
 * @param {Points.Point} point 
 * @returns number
 */
export function distanceFromMiddleOfRect(rect, point) {
  if (rect != undefined) {
    const middlePoint = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }

    const distance = Points.distance(point, middlePoint);
    return distance;
  }
}

/**
 * 
 * @param {Rects.RectPositioned} rect 
 * @param {Points.Point} point 
 * @param {Rects.RectPositioned} startRect 
 * @returns Vectors.Vector
 */
export function vectorFromMiddle(rect, point, startRect) {
  if (rect != undefined) {
    const middlePoint = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }

    const multiplier = rectGrowth(startRect, rect) * 0.5;

    const line = Lines.fromPoints(point, middlePoint);
    const vector = Vectors.fromLineCartesian(line);
    const multiplied = Vectors.multiply(vector, { x: multiplier, y: multiplier});

    return multiplied;
  }
}


/**
 * 
 * @param {Rects.RectPositioned} initialSize
 * @param {Rects.RectPositioned} currentSize 
 * @returns number
 */
export function rectGrowth(initialSize, currentSize) {

  let initialPos = {
    x: initialSize.x,
    y: initialSize.y
  }

  let initialCenter = Rects.center(initialSize);
  let initialDistance = Points.distance(initialCenter, initialPos)

  let currentPos = {
    x: currentSize.x,
    y: currentSize.y
  }

  let currentCenter = Rects.center(currentSize);
  let currentDistance = Points.distance(currentCenter, currentPos);

  let difference = initialDistance - currentDistance;
  return difference;
}



/**
 * Make `x` and `y` relative with respect to window dimensions
 * @param {PointerEvent} event
 * @returns {{x:number,y:number}}  
 */
export const relativePointerEvent = (event) => {
  return {
    x: event.x / window.innerWidth,
    y: event.y / window.innerHeight
  };
};

/**
 * Add up all pointer movement in provided `events`
 * @param {PointerEvent} pointerEvent
 * @returns {number}
 */
export const addUpMovement = (pointerEvent) => {
  let movement = 0;
  const events = `getCoalescedEvents` in pointerEvent ? pointerEvent.getCoalescedEvents() : [pointerEvent];
  for (const event of events) {
    let { x, y } = relativePoint(event.movementX, event.movementY);

    // Movement can be negative,
    // we don't care about that
    x = Math.abs(x);
    y = Math.abs(y);

    // Combine movement values, using 0.01 as the lower-bound 
    movement += x + y;
  }
  return movement;
};