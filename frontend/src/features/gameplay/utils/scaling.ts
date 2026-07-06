import { Dimensions, PixelRatio } from 'react-native';

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
