export function calculateRelativePosition(x, y, imgWidth, imgHeight) {
  return {
    left: (x / imgWidth) * 100,
    top: (y / imgHeight) * 100
  };
}
