import { Points, Rects } from "ixfx/geometry.js";

/**
 * @typedef ThingOrig readonly
 * @property {string} id
 * @property {Points.Point} pos
 * @property {number} radius
 * @property {HTMLElement} el
 * @property {boolean} selected
 * @property {Points.Point} velocity
 * @property {number} mass
 * @property {Points.Point} acceleration
*/

/** 
 * @typedef {Readonly<{
 * id: string
 * x: number
 * y: number
 * radius: number
 * el:HTMLElement
 * selected:boolean
 * velocity:Points.Point
 * mass:number 
 * acceleration: Points.Point
 * }>} Thing
 */

/**
 * Create and return a 'Thing' object with the given 'id'
 * @param {number} id - The unique identifier for the Thing
 * @returns {Thing} - A Thing object
 */
export function create(id) {
  // Create an HTML element to display the Thing
  const element = document.createElement(`div`);
  element.classList.add(`thing`);
  element.id = `${id}`;
  document.body.append(element);

  // Define initial properties for the Thing
  const radius = 0.05;
  const sizeX = radius * window.innerWidth;
  const sizeY = radius * window.innerWidth;
  const selected = false;
  const velocity = { x: 0, y: 0 };
  const mass = Math.random();
  const acceleration = { x: 0, y: 0 };


  // Set the width and height of the HTML element
  element.style.width = `${sizeX}px`;
  element.style.height = `${sizeY}px`;

  // Return the Thing object
  return {
    id: id.toString(),
    x: Math.random(),
    y: Math.random(),
    radius,
    el: element,
    selected,
    velocity,
    mass,
    acceleration
  }
}


/**
 * Update the position and appearance of the HTML element
 * to match the Thing's position and selection state
 * @param {Thing} thing - The Thing to update
 */
export function use(thing) {
  const { el, x, y, radius, selected, velocity } = thing;

  // Calculate the absolute position based on the window dimensions
  const absPos = Points.multiply({ x, y }, window.innerWidth, window.innerHeight);
  const width = radius * window.innerWidth;
  const height = radius * window.innerWidth;
  const offsetPos = Points.subtract(absPos, width / 2, height / 2);


  // Add or remove the "selected" class based on the 'selected' property
  if (selected) {
    thing.el.classList.add("selected");
  } else {
    thing.el.classList.remove("selected");
  }

  // Apply a CSS transform to move the HTML element
  el.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`;
}


/**
 * Update a Thing with new properties from 'newThing'
 * @param {Thing} thing - The Thing to update
 * @param {Thing} newThing - The new properties to apply
 * @returns {Thing} - The updated Thing object
 */
export function update(thing, newThing) {
  return {
    ...thing,
    ...newThing,
  }
}

/**
 * Check if a Thing intersects with a given rectangle
 * @param {Thing} thing - The Thing to check for intersection
 * @param {Rects.RectPositioned | undefined} rect - The rectangle to check for intersection
 * @returns {boolean} - True if the Thing intersects with the rectangle, false otherwise
 */
export function checkIntersection(thing, rect) {
  if (rect === undefined) return false;

  // Check if the thing intersects with the rectangle
  return Rects.isIntersecting(rect, thing);
}

/**
 * Create and return an array of 'Thing' objects with the specified 'amount'
 * @param {number} amount - The number of Things to create
 * @returns {Thing[]} - An array of Thing objects
 */
export function setup(amount) {
  const things = [];

  // Create the specified number of Things and add them to the array
  for (let index = 0; index < amount; index++) {
    things.push(create(index));
  }

  // Position and display the Things on the screen
  for (let thing of things) {
    use(thing)
  }

  return things;
}
