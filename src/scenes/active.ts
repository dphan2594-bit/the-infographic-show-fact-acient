// Single switch point for which scene list actually renders.
//
// `npm run build:scenes` reads content/manifest.json + your real
// images/audio and writes src/scenes/generated.ts. Once that file exists,
// flip the export below to `generatedScenes` (from "./generated") to render
// your real video instead of the Kim Tự Tháp Giza demo.
export { sampleScenes as activeScenes } from "./sample";
