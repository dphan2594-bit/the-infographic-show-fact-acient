/**
 * example-scene.tsx — copy-and-rename template for the
 * "linh vật video (Vox-style mascot reaction)" pipeline.
 *
 * HOW TO USE
 *   1. cp this file to src/<VideoName>.tsx
 *   2. Rename ExampleReaction -> <VideoName>, and the two exported constants
 *      EXAMPLE_CANVAS / EXAMPLE_TOTAL_FRAMES -> <NAME>_CANVAS / <NAME>_TOTAL_FRAMES.
 *   3. Replace SCENES with the segmentation from step 3 of SKILL.md, and AUDIO_SRC
 *      with the voiceover you copied into public/.
 *   4. Register it in src/Composition.tsx (see step 6 of SKILL.md).
 *
 * Everything below is deliberately dependency-free (plain remotion + inline styles)
 * so the template drops into any Remotion project without pulling in this repo's
 * scene-manifest machinery.
 */

import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ------------------------------------------------------------------ *
 * Canvas + audio
 * ------------------------------------------------------------------ */

// 9:16 for Shorts/TikTok/Reels; swap to 1920x1080 if the user picked horizontal.
export const EXAMPLE_CANVAS = { width: 1080, height: 1920, fps: 30 } as const;

const AUDIO_SRC = "voice.mp3";

// Crossfade length. Each scene starts FADE frames early and only fades IN, painting
// over the previous scene's still-opaque tail — see the Reveal comment below.
const FADE = 12;

/* ------------------------------------------------------------------ *
 * Palette — chunky cartoon-sticker look
 * ------------------------------------------------------------------ */

const INK = "#141414";
const CREAM = "#FFF6E5";
const ACCENT = "#FF4D4D";
const ACCENT_2 = "#2F6BFF";
const YELLOW = "#FFD23F";

/* ------------------------------------------------------------------ *
 * Scene model
 * ------------------------------------------------------------------ */

type EnterPreset =
  | "fall"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "spin"
  | "drift"
  | "bigBounce"
  | "pop";

type SceneStyle =
  | "photo"
  | "handdrawn"
  | "diagram"
  | "comic"
  | "reactionCam"
  | "tvSplit";

type SceneSpec = {
  /** Speech start in seconds, straight from Whisper. Scenes chain back-to-back. */
  from: number;
  /** Speech end in seconds. Keep every scene <= 10s; 2-4s is often better. */
  to: number;
  style: SceneStyle;
  /** SHORT highlight, 3-8 words — not the whole narrated sentence. */
  text: string;
  /** File under public/mascots/<name>/ — pick the expression that fits the line. */
  mascot: string;
  /** Rotate this: never the same entrance twice in a row. */
  enter: EnterPreset;
  /** public/ path of the photo (style "photo") or clip (video styles). */
  asset?: string;
  /** Seconds into the clip to start from, so reused footage looks different. */
  clipStartSeconds?: number;
  /** Tint for the handdrawn/comic cards. */
  tint?: string;
};

const MASCOT_DIR = "mascots/example";

/**
 * Replace wholesale with the real segmentation. Note how style and enter rotate and
 * never repeat back-to-back, and how each `from` picks up exactly where the previous
 * scene's speech started — no gaps, no dead air.
 */
const SCENES: SceneSpec[] = [
  {
    from: 0,
    to: 3.4,
    style: "handdrawn",
    text: "3 TIM?!",
    mascot: "shock.png",
    enter: "fall",
    tint: CREAM,
  },
  {
    from: 3.4,
    to: 8.1,
    style: "photo",
    text: "Bạch tuộc không đùa",
    mascot: "curious.png",
    enter: "left",
    asset: "octopus.jpg",
  },
  {
    from: 8.1,
    to: 12.6,
    style: "diagram",
    text: "2 tim bơm mang",
    mascot: "explain.png",
    enter: "bottom",
  },
  {
    from: 12.6,
    to: 17.0,
    style: "reactionCam",
    text: "Tim thứ 3 nghỉ hưu",
    mascot: "wink.png",
    enter: "spin",
    asset: "ocean_clip.mp4",
  },
  {
    from: 17.0,
    to: 21.8,
    style: "comic",
    text: "Bơi là nó ngừng đập",
    mascot: "worried.png",
    enter: "right",
  },
  {
    from: 21.8,
    to: 26.5,
    style: "tvSplit",
    text: "Nên nó thích bò hơn",
    mascot: "happy.png",
    enter: "bigBounce",
    asset: "ocean_clip.mp4",
    clipStartSeconds: 4,
  },
];

/* ------------------------------------------------------------------ *
 * Frame maths
 * ------------------------------------------------------------------ */

const sceneFrames = (s: SceneSpec, fps: number) => Math.round((s.to - s.from) * fps);

const sceneStarts = (fps: number) => {
  let acc = 0;
  return SCENES.map((s) => {
    const start = acc;
    acc += sceneFrames(s, fps);
    return start;
  });
};

export const EXAMPLE_TOTAL_FRAMES = SCENES.reduce(
  (total, s) => total + sceneFrames(s, EXAMPLE_CANVAS.fps),
  0,
);

/* ------------------------------------------------------------------ *
 * Mascot — 9 entrance presets + permanent idle motion
 * ------------------------------------------------------------------ */

type EnterFrom = { x: number; y: number; rotate: number; scale: number };

/**
 * Each preset is where the mascot comes FROM (offsets in px, relative to its resting
 * spot) — a spring drives it to 0/0/0/1. Add a preset here if a line needs a motion
 * none of these capture; don't fall back to "pop" for everything.
 */
const ENTER_PRESETS: Record<EnterPreset, EnterFrom> = {
  fall: { x: 0, y: -900, rotate: -25, scale: 0.7 },
  top: { x: 0, y: -620, rotate: 8, scale: 0.85 },
  bottom: { x: 0, y: 700, rotate: -8, scale: 0.85 },
  left: { x: -820, y: 60, rotate: -18, scale: 0.8 },
  right: { x: 820, y: 60, rotate: 18, scale: 0.8 },
  spin: { x: 420, y: -420, rotate: 320, scale: 0.5 },
  drift: { x: -320, y: 260, rotate: -6, scale: 0.9 },
  bigBounce: { x: 0, y: 820, rotate: 0, scale: 1.6 },
  pop: { x: 0, y: 0, rotate: 0, scale: 0.2 },
};

const Mascot: React.FC<{
  src: string;
  enter: EnterPreset;
  size: number;
  /** Idle wobble amplitude multiplier — dial down inside small bubbles. */
  idle?: number;
}> = ({ src, enter, size, idle = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = ENTER_PRESETS[enter];

  const s = spring({ frame, fps, config: { damping: 12, mass: 0.8, stiffness: 110 } });

  const x = interpolate(s, [0, 1], [from.x, 0]);
  const y = interpolate(s, [0, 1], [from.y, 0]);
  const rotate = interpolate(s, [0, 1], [from.rotate, 0]);
  const scale = interpolate(s, [0, 1], [from.scale, 1]);

  // Idle bob/wobble runs forever so the mascot never sits frozen mid-scene.
  const bob = Math.sin(frame / 9) * 10 * idle;
  const tilt = Math.sin(frame / 14) * 2.5 * idle;

  return (
    <Img
      src={staticFile(`${MASCOT_DIR}/${src}`)}
      style={{
        width: size,
        height: "auto",
        transform: `translate(${x}px, ${y + bob}px) rotate(${rotate + tilt}deg) scale(${scale})`,
        filter: "drop-shadow(0 18px 26px rgba(0,0,0,0.28))",
      }}
    />
  );
};

/* ------------------------------------------------------------------ *
 * Punch text
 * ------------------------------------------------------------------ */

const PunchText: React.FC<{
  children: string;
  color?: string;
  size?: number;
  delay?: number;
}> = ({ children, color = INK, size = 96, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 140 },
  });
  const scale = interpolate(s, [0, 1], [0.55, 1]);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity: s,
        color,
        fontFamily: "'Andika', 'Baloo 2', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        textAlign: "center",
        textShadow: "0 6px 0 rgba(0,0,0,0.16)",
        maxWidth: "86%",
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Layout helper — keeps content inside the eye-level band
 * ------------------------------------------------------------------ */

/**
 * The middle 60-70% of the frame. Every text container goes inside this — a caption
 * that drifts into the top/bottom ~15% is a bug, not a style choice.
 */
const EyeLevel: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 36,
}) => (
  <AbsoluteFill
    style={{
      top: "17%",
      height: "66%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap,
      padding: "0 64px",
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ *
 * Style 1 — real photo + Ken Burns + corner mascot
 * ------------------------------------------------------------------ */

const ScenePhoto: React.FC<{ scene: SceneSpec; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.18], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {scene.asset ? (
        <Img
          src={staticFile(scene.asset)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      ) : null}
      {/* Gradient so white punch text stays legible over any photo. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <EyeLevel>
        <PunchText color="#fff">{scene.text}</PunchText>
      </EyeLevel>
      <AbsoluteFill
        style={{
          alignItems: "flex-end",
          justifyContent: "flex-end",
          // Bottom clearance is deliberately larger than the side padding: the idle
          // bob (+10px) and the drop shadow (18px offset / 26px blur) both extend
          // past the image box, and a corner mascot clips off-frame without it.
          padding: "0 64px 96px 0",
        }}
      >
        <Mascot src={scene.mascot} enter={scene.enter} size={420} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Style 2 — hand-drawn frame card
 * ------------------------------------------------------------------ */

/** Wobbly SVG border — intentionally imperfect so it reads as hand-drawn. */
const HandDrawnFrame: React.FC = () => (
  <svg
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  >
    <path
      d="M28,34 C240,18 700,26 966,32 C978,300 972,690 968,962 C700,978 260,970 34,966 C22,700 30,300 28,34 Z"
      fill="none"
      stroke={INK}
      strokeWidth={9}
      strokeLinecap="round"
    />
  </svg>
);

const SceneHandDrawn: React.FC<{ scene: SceneSpec }> = ({ scene }) => (
  <AbsoluteFill style={{ backgroundColor: scene.tint ?? CREAM }}>
    <AbsoluteFill style={{ padding: 48 }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <HandDrawnFrame />
      </div>
    </AbsoluteFill>
    <EyeLevel gap={12}>
      <PunchText size={140} color={ACCENT}>
        {scene.text}
      </PunchText>
      <Mascot src={scene.mascot} enter={scene.enter} size={460} />
    </EyeLevel>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ *
 * Style 3 — vox diagram
 * ------------------------------------------------------------------ */

/** Swap this for whatever icon the line is actually about (arrow, chart, organ...). */
const DiagramIcon: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = 1 + Math.sin(frame / 6) * 0.06;
  return (
    <svg width={320} height={320} viewBox="0 0 100 100">
      <path
        d="M50 84 C20 62 8 44 18 28 C26 15 44 16 50 30 C56 16 74 15 82 28 C92 44 80 62 50 84 Z"
        fill={ACCENT}
        stroke={INK}
        strokeWidth={4}
        style={{ transform: `scale(${beat})`, transformOrigin: "50px 50px" }}
      />
    </svg>
  );
};

const SceneDiagram: React.FC<{ scene: SceneSpec }> = ({ scene }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#F3F6FF",
      backgroundImage: `radial-gradient(${ACCENT_2}33 3px, transparent 3px)`,
      backgroundSize: "44px 44px",
    }}
  >
    <EyeLevel gap={28}>
      {/* One flex group, fixed gap — mascot and diagram can't drift or collide. */}
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <Mascot src={scene.mascot} enter={scene.enter} size={400} />
        <DiagramIcon />
      </div>
      <PunchText size={88} color={ACCENT_2}>
        {scene.text}
      </PunchText>
    </EyeLevel>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ *
 * Style 4 — comic speech bubble
 * ------------------------------------------------------------------ */

const SceneComicBubble: React.FC<{ scene: SceneSpec }> = ({ scene }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(160deg, ${YELLOW} 0%, ${ACCENT} 100%)`,
    }}
  >
    <EyeLevel>
      {/*
        THE FIX: mascot + bubble are ONE centered flex group with a fixed gap.
        The earlier version positioned each half independently (marginRight on the
        mascot, marginLeft on the bubble) and they collided on one side while the
        other side of the frame sat empty — a user-reported bug.
      */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            background: "#fff",
            border: `9px solid ${INK}`,
            borderRadius: 48,
            padding: "44px 56px",
            boxShadow: "0 20px 0 rgba(0,0,0,0.18)",
          }}
        >
          <PunchText size={84}>{scene.text}</PunchText>
          {/* bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: -46,
              left: "50%",
              marginLeft: -28,
              width: 0,
              height: 0,
              borderLeft: "28px solid transparent",
              borderRight: "28px solid transparent",
              borderTop: `46px solid ${INK}`,
            }}
          />
        </div>
        <Mascot src={scene.mascot} enter={scene.enter} size={460} />
      </div>
    </EyeLevel>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ *
 * Style 5 — video full-bleed + reaction-cam bubble
 * ------------------------------------------------------------------ */

const SceneReactionCam: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {scene.asset ? (
        // Video, NOT OffthreadVideo — OffthreadVideo freezes in live Studio playback.
        <Video
          src={staticFile(scene.asset)}
          startFrom={Math.round((scene.clipStartSeconds ?? 0) * fps)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
      <EyeLevel>
        <PunchText color="#fff" size={92}>
          {scene.text}
        </PunchText>
      </EyeLevel>
      {/* streamer-style webcam bubble */}
      <AbsoluteFill
        style={{ alignItems: "flex-end", justifyContent: "flex-start", padding: 56 }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: "50%",
            border: `10px solid ${YELLOW}`,
            background: CREAM,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 34px rgba(0,0,0,0.4)",
          }}
        >
          <Mascot src={scene.mascot} enter={scene.enter} size={330} idle={0.5} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Style 6 — TV-bezel split screen
 * ------------------------------------------------------------------ */

const SceneTvSplit: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  // Pixel geometry, NOT `aspectRatio` + a percentage width. As a flex item the bezel
  // gets `min-height: auto`, so the clip inside it forces the box taller than the
  // ratio and the "TV" comes out nearly square. Computing the numbers avoids that.
  const PAD = 56;
  const BEZEL = 26;
  const frameWidth = Math.round(vertical ? width - PAD * 2 : width * 0.5);
  const screenWidth = frameWidth - BEZEL * 2;
  const screenHeight = Math.round((screenWidth * 9) / 16);

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${CREAM} 0%, #FFE9C7 100%)` }}
    >
      {/* Whole split sits in the eye-level band so the caption can't sink into the
          bottom margin once the TV frame takes up its share of the height. */}
      <AbsoluteFill
        style={{
          top: "8%",
          height: "84%",
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          padding: `0 ${PAD}px`,
        }}
      >
        {/* TV bezel */}
        <div
          style={{
            flex: "0 0 auto",
            background: INK,
            borderRadius: 40,
            padding: BEZEL,
            boxShadow: "0 24px 40px rgba(0,0,0,0.3)",
            width: frameWidth,
          }}
        >
          <div
            style={{
              width: screenWidth,
              height: screenHeight,
              borderRadius: 18,
              overflow: "hidden",
              background: "#000",
            }}
          >
            {scene.asset ? (
              <Video
                src={staticFile(scene.asset)}
                startFrom={Math.round((scene.clipStartSeconds ?? 0) * fps)}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
        </div>

        {/* mascot + text as one group on the other side */}
        <div
          style={{
            flex: "0 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <Mascot src={scene.mascot} enter={scene.enter} size={vertical ? 380 : 320} />
          <PunchText size={76}>{scene.text}</PunchText>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Crossfade wrapper
 * ------------------------------------------------------------------ */

/**
 * True crossfade, not two fades to black.
 *
 * Every scene's <Sequence> starts FADE frames EARLY, so it overlaps the tail of the
 * previous scene while that one is still fully opaque, and it only ever fades IN.
 * Because later scenes render after earlier ones in JSX order, the outgoing scene is
 * simply painted over — it never needs to fade out and never exposes black canvas.
 * Only the final scene also fades out, for a clean ending.
 *
 * "Simplifying" this into a symmetric fade-in/fade-out reintroduces the black flash.
 */
const Reveal: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ children, durationInFrames, isFirst, isLast }) => {
  const frame = useCurrentFrame();

  const fadeIn = isFirst
    ? 1
    : interpolate(frame, [0, FADE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const fadeOut = isLast
    ? interpolate(frame, [durationInFrames - FADE, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ *
 * Dispatch + root component
 * ------------------------------------------------------------------ */

const SceneBody: React.FC<{ scene: SceneSpec; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
  switch (scene.style) {
    case "photo":
      return <ScenePhoto scene={scene} durationInFrames={durationInFrames} />;
    case "handdrawn":
      return <SceneHandDrawn scene={scene} />;
    case "diagram":
      return <SceneDiagram scene={scene} />;
    case "comic":
      return <SceneComicBubble scene={scene} />;
    case "reactionCam":
      return <SceneReactionCam scene={scene} />;
    case "tvSplit":
      return <SceneTvSplit scene={scene} />;
  }
};

export const ExampleReaction: React.FC = () => {
  const { fps } = useVideoConfig();
  const starts = sceneStarts(fps);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Audio src={staticFile(AUDIO_SRC)} />
      {SCENES.map((scene, i) => {
        const isFirst = i === 0;
        const isLast = i === SCENES.length - 1;
        const body = sceneFrames(scene, fps);
        // Start FADE frames early (except the first scene) so scenes overlap.
        const from = isFirst ? starts[i] : starts[i] - FADE;
        const durationInFrames = isFirst ? body : body + FADE;

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <Reveal
              durationInFrames={durationInFrames}
              isFirst={isFirst}
              isLast={isLast}
            >
              <SceneBody scene={scene} durationInFrames={durationInFrames} />
            </Reveal>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
