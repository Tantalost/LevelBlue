import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const LW = Math.max(W, H);
const PW = Math.min(W, H);
const PH = Math.max(W, H);

const scaleP = Math.min(PW / 390, PH / 844, 1.0);
const scaleL = LW / 932;

export const normP = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleP));

export const normL = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleL));

export const landscapeWidth = LW;

/** Reactive hook: recalculates whenever orientation changes */
export function useLandscapeWidth(): number {
  const { width, height } = useWindowDimensions();
  return Math.max(width, height);
}

export function useLandscapeScaling() {
  const { width, height } = useWindowDimensions();
  const lw = Math.max(width, height);
  const pw = Math.min(width, height);
  const scL = lw / 932;
  const scP = Math.min(pw / 390, 1.0);
  const nL = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scL));
  const nP = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scP));
  return { lw, pw, nL, nP };
}
