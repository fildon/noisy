// @ts-check
/**
 * Height of the canvas in screen pixels
 */
const CANVAS_HEIGHT = 1000;
/**
 * Width of the canvas in screen pixels
 */
const CANVAS_WIDTH = 1000;

/**
 * The number of pixels both vertically and horizontally
 */
const GRID_SIZE = 100;
// +1 thanks to the fence post problem
const GRID_ROWS = CANVAS_HEIGHT / GRID_SIZE + 1;
const GRID_COLS = CANVAS_WIDTH / GRID_SIZE + 1;

const canvasElement = document.querySelector("canvas");
if (canvasElement === null) throw new Error("Could not find canvas element");
const canvasContext = canvasElement.getContext("2d");
if (canvasContext === null) throw new Error("Could not retrieve 2d context");

/**
 * Creates a new closure representing a vector rotating over time.
 * @returns {function(number): [number, number]}
 */
const createAnimatedRandomVector = () => {
  const initialRadians = Math.random() * 2 * Math.PI;
  const radiansPerMillisecond = (1 + 9 * Math.random()) / 2000;

  return (milliseconds) => [
    Math.cos(initialRadians + radiansPerMillisecond * milliseconds),
    Math.sin(initialRadians + radiansPerMillisecond * milliseconds),
  ];
};

/**
 * Create a 2D array of rotating vectors.
 */
const animatedVectorGrid = Array.from({ length: GRID_ROWS }, () =>
  Array.from({ length: GRID_COLS }, createAnimatedRandomVector)
);

/**
 * @param {[number, number]} VectorA
 * @param {[number, number]} VectorB
 * @returns Dot product of A and B
 */
const dotProduct = ([ax, ay], [bx, by]) => ax * bx + ay * by;

/**
 * Interpolate between numbers `a` and `b`, using some 0 to 1 `weight`.
 * If `weight <= 0` then return `a`.
 * If `weight >= 1` then return `b`
 * Otherwise return smoothstep between `a` and `b`.
 * @see https://en.wikipedia.org/wiki/Smoothstep
 * @param {number} a
 * @param {number} b
 * @param {number} weight
 * @returns A smoothly interpolated value between `a` and `b`.
 */
const interpolate = (a, b, weight) => {
  if (weight <= 0) return a;
  if (weight >= 1) return b;
  // https://en.wikipedia.org/wiki/Smoothstep
  const smoothStep = weight * weight * (3 - 2 * weight);

  return a * (1 - smoothStep) + b * smoothStep;
};

/**
 * Top-level animation loop handler.
 * @param {number} now
 */
const step = (now) => {
  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const staticVectorGrid = animatedVectorGrid.map((vectorRow) =>
    vectorRow.map((vector) => vector(now))
  );

  for (
    let pixelRowIndex = 0;
    pixelRowIndex < CANVAS_HEIGHT;
    pixelRowIndex += 10
  ) {
    const y_offset = pixelRowIndex % GRID_SIZE;
    const grid_row_index = (pixelRowIndex - y_offset) / GRID_SIZE;
    for (
      let pixelColIndex = 0;
      pixelColIndex < CANVAS_WIDTH;
      pixelColIndex += 10
    ) {
      const x_offset = pixelColIndex % GRID_SIZE;
      const grid_col_index = (pixelColIndex - x_offset) / GRID_SIZE;

      const gridTopLeft = staticVectorGrid[grid_row_index][grid_col_index];
      const gridTopRight = staticVectorGrid[grid_row_index][grid_col_index + 1];
      const gridBottomLeft =
        staticVectorGrid[grid_row_index + 1][grid_col_index];
      const gridBottomRight =
        staticVectorGrid[grid_row_index + 1][grid_col_index + 1];

      // Dot products
      const topLeftDotProduct = dotProduct(gridTopLeft, [x_offset, y_offset]);
      const topRightDotProduct = dotProduct(gridTopRight, [
        GRID_SIZE - x_offset,
        y_offset,
      ]);
      const bottomLeftDotProduct = dotProduct(gridBottomLeft, [
        x_offset,
        GRID_SIZE - y_offset,
      ]);
      const bottomRightDotProduct = dotProduct(gridBottomRight, [
        GRID_SIZE - x_offset,
        GRID_SIZE - y_offset,
      ]);

      // Interpolation
      const topInterolation = interpolate(
        topLeftDotProduct,
        topRightDotProduct,
        x_offset / GRID_SIZE
      );
      const bottomInterpolation = interpolate(
        bottomLeftDotProduct,
        bottomRightDotProduct,
        x_offset / GRID_SIZE
      );

      // A value between -1 and 1.
      const perlinValue = interpolate(
        topInterolation,
        bottomInterpolation,
        y_offset / GRID_SIZE
      );

      const transparency = ((perlinValue + 1) / 2) * 100;

      canvasContext.fillStyle = `rgb(255 255 255 / ${transparency}%)`;
      canvasContext.fillRect(pixelColIndex, pixelRowIndex, 5, 5);
    }
  }

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
