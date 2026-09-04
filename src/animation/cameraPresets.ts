import type { CameraConfig, CameraKeyframe } from "./useCamera";

/**
 * Named camera moves, so a 55-scene manifest can say `"camera": "push-in"`
 * instead of hand-writing keyframes for every shot.
 *
 * Every preset is written around a focus point (`focusX`/`focusY`, in percent
 * of the frame): the spot in the artwork the move is about. Point it at the
 * subject of the scene — a face, a chart, a spacecraft — and the same preset
 * reads correctly on any picture.
 *
 * `intensity` scales how far the move travels (1 = default, 1.6 = bolder,
 * 0.5 = barely there) without changing its shape.
 */
export type CameraPresetName =
  | "hold"
  | "drift"
  | "push-in"
  | "push-in-fast"
  | "pull-back"
  | "reveal"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "punch-in"
  | "sweep"
  | "orbit-drift";

export type CameraPresetInput = {
  preset: CameraPresetName;
  /** the point the move is about, in percent of the frame; defaults to centre */
  focusX?: number;
  focusY?: number;
  /** scales the travel of the move, default 1 */
  intensity?: number;
  /** overrides the preset's own floating drift */
  driftPercent?: number;
  driftSeconds?: number;
};

/** zoom, scaled away from 1 by the intensity factor */
const z = (zoom: number, k: number) => 1 + (zoom - 1) * k;

/** focus point, scaled away from centre by the intensity factor */
const f = (focus: number, k: number) => 50 + (focus - 50) * k;

type Preset = {
  /** builds the keyframe track from the focus point and intensity */
  build: (focusX: number, focusY: number, k: number) => CameraKeyframe[];
  /** how much this move floats on top of its keyframes */
  drift: number;
  description: string;
};

const PRESETS: Record<CameraPresetName, Preset> = {
  hold: {
    description: "Gần như đứng yên — cho cảnh nhiều chữ, chỉ thở rất nhẹ.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.04, k), focusX: x, focusY: y },
      { at: 100, zoom: z(1.07, k), focusX: x, focusY: y },
    ],
    drift: 0.3,
  },
  drift: {
    description: "Không đẩy, chỉ trôi bồng bềnh quanh điểm nhấn.",
    build: (x, y, k) => [{ at: 0, zoom: z(1.09, k), focusX: x, focusY: y }],
    drift: 0.9,
  },
  "push-in": {
    description: "Đẩy vào chậm, đều — chuyển động mặc định an toàn nhất.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.03, k), focusX: 50 + (x - 50) * 0.3, focusY: 50 + (y - 50) * 0.3 },
      { at: 100, zoom: z(1.24, k), focusX: f(x, k), focusY: f(y, k) },
    ],
    drift: 0.4,
  },
  "push-in-fast": {
    description: "Đẩy vào nhanh và dứt khoát — dùng cho hook hoặc cú nhấn.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.02, k), focusX: 50, focusY: 50 },
      { at: 55, zoom: z(1.28, k), focusX: f(x, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.34, k), focusX: f(x, k), focusY: f(y, k) },
    ],
    drift: 0.35,
  },
  "pull-back": {
    description: "Bắt đầu cận, lùi ra để lộ toàn cảnh — mở màn hoặc kết đoạn.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.3, k), focusX: f(x, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.04, k), focusX: 50, focusY: 50 },
    ],
    drift: 0.4,
  },
  reveal: {
    description: "Cận điểm nhấn → lùi ra toàn cảnh → đẩy nhẹ lại. Ba nhịp.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.32, k), focusX: f(x, k), focusY: f(y, k) },
      { at: 45, zoom: z(1.05, k), focusX: 50, focusY: 50 },
      { at: 100, zoom: z(1.16, k), focusX: f(50 + (x - 50) * 0.6, k), focusY: f(y, k) },
    ],
    drift: 0.5,
  },
  "pan-left": {
    description: "Lia sang trái ở mức zoom vừa — quét qua một dải nội dung.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.18, k), focusX: f(x + 12, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.18, k), focusX: f(x - 12, k), focusY: f(y, k) },
    ],
    drift: 0.35,
  },
  "pan-right": {
    description: "Lia sang phải — hợp với cảnh có chuyển động trái sang phải.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.18, k), focusX: f(x - 12, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.18, k), focusX: f(x + 12, k), focusY: f(y, k) },
    ],
    drift: 0.35,
  },
  "tilt-up": {
    description: "Hất máy lên — từ mặt đất lên bầu trời, từ chân lên đỉnh.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.18, k), focusX: f(x, k), focusY: f(y + 12, k) },
      { at: 100, zoom: z(1.2, k), focusX: f(x, k), focusY: f(y - 12, k) },
    ],
    drift: 0.35,
  },
  "tilt-down": {
    description: "Chúc máy xuống — từ trời xuống đất, dẫn mắt vào chủ thể dưới.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.18, k), focusX: f(x, k), focusY: f(y - 12, k) },
      { at: 100, zoom: z(1.2, k), focusX: f(x, k), focusY: f(y + 12, k) },
    ],
    drift: 0.35,
  },
  "punch-in": {
    description: "Giữ yên, rồi nhấn một phát vào điểm nhấn ở giữa cảnh.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.04, k), focusX: 50, focusY: 50 },
      { at: 40, zoom: z(1.05, k), focusX: 50, focusY: 50 },
      { at: 58, zoom: z(1.22, k), focusX: f(x, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.25, k), focusX: f(x, k), focusY: f(y, k) },
    ],
    drift: 0.3,
  },
  sweep: {
    description: "Vừa đẩy vào vừa lia chéo — cảnh có nhiều chi tiết trải rộng.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.06, k), focusX: f(x - 10, k), focusY: f(y - 6, k) },
      { at: 100, zoom: z(1.26, k), focusX: f(x + 8, k), focusY: f(y + 5, k) },
    ],
    drift: 0.45,
  },
  "orbit-drift": {
    description: "Zoom vừa, trôi vòng rộng — cảnh vũ trụ, cảnh chờ, cảnh nền.",
    build: (x, y, k) => [
      { at: 0, zoom: z(1.14, k), focusX: f(x, k), focusY: f(y, k) },
      { at: 100, zoom: z(1.18, k), focusX: f(x, k), focusY: f(y, k) },
    ],
    drift: 1.3,
  },
};

export const cameraPresetNames = Object.keys(PRESETS) as CameraPresetName[];

export const describeCameraPreset = (name: CameraPresetName) => PRESETS[name].description;

/** Turns a preset name (plus focus/intensity) into a plain keyframe camera. */
export const resolveCameraPreset = (input: CameraPresetInput): CameraConfig => {
  const preset = PRESETS[input.preset] ?? PRESETS["push-in"];
  const focusX = input.focusX ?? 50;
  const focusY = input.focusY ?? 50;
  const intensity = input.intensity ?? 1;

  return {
    keyframes: preset.build(focusX, focusY, intensity),
    driftPercent: input.driftPercent ?? preset.drift,
    driftSeconds: input.driftSeconds ?? 9,
  };
};
