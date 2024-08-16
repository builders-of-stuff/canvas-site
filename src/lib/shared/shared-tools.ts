import { PLAY_MAT_HEIGHT, PLAY_MAT_WIDTH } from './shared.constant';

export function calculateRelativePosition(x, y, imgWidth, imgHeight) {
  return {
    // Using original size of PlayMat image
    left: (x / PLAY_MAT_WIDTH) * imgWidth,
    top: (y / PLAY_MAT_HEIGHT) * imgHeight
  };
}
