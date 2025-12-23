const A4_WIDTH_POINTS = 595.28;
const A4_HEIGHT_POINTS = 841.89;

export function normalizeCoords(pixelCoords, canvasWidth, canvasHeight) {
  return {
    x: (pixelCoords.x / canvasWidth) * 100,
    y: (pixelCoords.y / canvasHeight) * 100,
    width: (pixelCoords.width / canvasWidth) * 100,
    height: (pixelCoords.height / canvasHeight) * 100,
  };
}

export function denormalizeCoords(percentCoords) {
  const xPoints = (percentCoords.x / 100) * A4_WIDTH_POINTS;
  const yPoints = (percentCoords.y / 100) * A4_HEIGHT_POINTS;
  const widthPoints = (percentCoords.width / 100) * A4_WIDTH_POINTS;
  const heightPoints = (percentCoords.height / 100) * A4_HEIGHT_POINTS;

  const yFlipped = A4_HEIGHT_POINTS - yPoints - heightPoints;

  return {
    x: xPoints,
    y: yFlipped,
    width: widthPoints,
    height: heightPoints,
  };
}
