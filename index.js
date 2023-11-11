// @ts-check
const CANVAS_HEIGHT = 1000;
const CANVAS_WIDTH = 1000;

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

  // At time `t` return `[x, y]`.
  return (milliseconds) => [
    Math.cos(initialRadians + radiansPerMillisecond * milliseconds),
    Math.sin(initialRadians + radiansPerMillisecond * milliseconds),
  ];
};

/**
 * Create a 2D array of rotating vectors.
 */
const animatedVectorGrid = Array.from({ length: 11 }, () =>
  Array.from({ length: 11 }, createAnimatedRandomVector)
);

/**
 * Top-level animation loop handler.
 * @param {number} now
 */
const step = (now) => {
  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let rowIndex = 0; rowIndex < animatedVectorGrid.length; rowIndex++) {
    const row = animatedVectorGrid[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const vectorAtTime = row[colIndex];
      const [x, y] = vectorAtTime(now);

      canvasContext.beginPath();
      canvasContext.arc(
        colIndex * 100,
        rowIndex * 100,
        Math.abs(x) * 20,
        0,
        2 * Math.PI
      );
      canvasContext.fillStyle = "red";
      canvasContext.fill();
    }
  }

  window.requestAnimationFrame(step);
};

window.requestAnimationFrame(step);
