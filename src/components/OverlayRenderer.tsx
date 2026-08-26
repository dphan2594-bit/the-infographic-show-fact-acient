import type { Overlay } from "../scenes/types";
import { ChapterTitleOverlay } from "./overlays/ChapterTitleOverlay";
import { DataBadgeOverlay } from "./overlays/DataBadgeOverlay";
import { IconLabelOverlay } from "./overlays/IconLabelOverlay";
import { DateHudOverlay } from "./overlays/DateHudOverlay";
import { CaptionOverlay } from "./overlays/CaptionOverlay";
import { StaggerBadgesOverlay } from "./overlays/StaggerBadgesOverlay";
import { ChartLineOverlay } from "./overlays/ChartLineOverlay";
import { ProcessFlowOverlay } from "./overlays/ProcessFlowOverlay";
import { OrbitSystemOverlay } from "./overlays/OrbitSystemOverlay";
import { SparkleBurstOverlay } from "./overlays/SparkleBurstOverlay";
import { StarLayerOverlay } from "./overlays/StarLayerOverlay";
import { GlowPulseOverlay } from "./overlays/GlowPulseOverlay";
import { ShootingStarsOverlay } from "./overlays/ShootingStarsOverlay";
import { DriftParticlesOverlay } from "./overlays/DriftParticlesOverlay";
import { EngineTrailOverlay } from "./overlays/EngineTrailOverlay";
import { CutoutOverlay } from "./overlays/CutoutOverlay";
import { SpriteOverlay } from "./overlays/SpriteOverlay";
import { BlinkOverlay } from "./overlays/BlinkOverlay";
import { SpotlightOverlay } from "./overlays/SpotlightOverlay";
import { BigTextOverlay } from "./overlays/BigTextOverlay";
import { CalloutRingOverlay } from "./overlays/CalloutRingOverlay";
import { FlashOverlay } from "./overlays/FlashOverlay";

export const OverlayRenderer: React.FC<{ overlay: Overlay }> = ({ overlay }) => {
  switch (overlay.type) {
    case "chapterTitle":
      return (
        <ChapterTitleOverlay
          title={overlay.title}
          subtitle={overlay.subtitle}
          accentColor={overlay.accentColor}
          plate={overlay.plate}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "dataBadge":
      return (
        <DataBadgeOverlay
          value={overlay.value}
          label={overlay.label}
          x={overlay.x}
          y={overlay.y}
          accentColor={overlay.accentColor}
          calloutTo={overlay.calloutTo}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "iconLabel":
      return (
        <IconLabelOverlay
          label={overlay.label}
          x={overlay.x}
          y={overlay.y}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "dateHud":
      return (
        <DateHudOverlay
          date={overlay.date}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "caption":
      return (
        <CaptionOverlay
          text={overlay.text}
          position={overlay.position}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "staggerBadges":
      return (
        <StaggerBadgesOverlay
          items={overlay.items}
          accentColor={overlay.accentColor}
          staggerFrames={overlay.staggerFrames}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "chartLine":
      return (
        <ChartLineOverlay
          points={overlay.points}
          color={overlay.color}
          drawEndFrame={overlay.drawEndFrame}
          showDot={overlay.showDot}
        />
      );
    case "orbitSystem":
      return (
        <OrbitSystemOverlay
          x={overlay.x}
          y={overlay.y}
          coreRadius={overlay.coreRadius}
          coreColor={overlay.coreColor}
          glowColor={overlay.glowColor}
          rings={overlay.rings}
          showCore={overlay.showCore}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "sparkleBurst":
      return (
        <SparkleBurstOverlay
          x={overlay.x}
          y={overlay.y}
          atFrame={overlay.atFrame}
          count={overlay.count}
          colors={overlay.colors}
          spread={overlay.spread}
          durationInFrames={overlay.durationInFrames}
          seed={overlay.seed}
        />
      );
    case "starLayer":
      return (
        <StarLayerOverlay
          density={overlay.density}
          seed={overlay.seed}
          driftSpeed={overlay.driftSpeed}
          opacity={overlay.opacity}
        />
      );
    case "glowPulse":
      return (
        <GlowPulseOverlay
          x={overlay.x}
          y={overlay.y}
          radius={overlay.radius}
          color={overlay.color}
          periodSeconds={overlay.periodSeconds}
          minOpacity={overlay.minOpacity}
          maxOpacity={overlay.maxOpacity}
        />
      );
    case "shootingStars":
      return (
        <ShootingStarsOverlay
          count={overlay.count}
          periodSeconds={overlay.periodSeconds}
          travelSeconds={overlay.travelSeconds}
          angleDeg={overlay.angleDeg}
          color={overlay.color}
          seed={overlay.seed}
        />
      );
    case "driftParticles":
      return (
        <DriftParticlesOverlay
          count={overlay.count}
          angleDeg={overlay.angleDeg}
          speed={overlay.speed}
          colors={overlay.colors}
          seed={overlay.seed}
          opacity={overlay.opacity}
        />
      );
    case "engineTrail":
      return (
        <EngineTrailOverlay
          x={overlay.x}
          y={overlay.y}
          angleDeg={overlay.angleDeg}
          length={overlay.length}
          spread={overlay.spread}
          count={overlay.count}
          color={overlay.color}
          travelSeconds={overlay.travelSeconds}
          seed={overlay.seed}
        />
      );
    case "cutout":
      return (
        <CutoutOverlay
          src={overlay.src}
          x={overlay.x}
          y={overlay.y}
          width={overlay.width}
          height={overlay.height}
          feather={overlay.feather}
          originX={overlay.originX}
          originY={overlay.originY}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "sprite":
      return (
        <SpriteOverlay
          src={overlay.src}
          x={overlay.x}
          y={overlay.y}
          width={overlay.width}
          height={overlay.height}
          originX={overlay.originX}
          originY={overlay.originY}
          swingDeg={overlay.swingDeg}
          swingShape={overlay.swingShape}
          entranceSpeed={overlay.entranceSpeed}
          motionBlur={overlay.motionBlur}
          alive={overlay.alive}
          weight={overlay.weight}
          bobPercent={overlay.bobPercent}
          breathePercent={overlay.breathePercent}
          periodSeconds={overlay.periodSeconds}
          phaseSeconds={overlay.phaseSeconds}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "blink":
      return (
        <BlinkOverlay
          x={overlay.x}
          y={overlay.y}
          width={overlay.width}
          height={overlay.height}
          color={overlay.color}
          periodSeconds={overlay.periodSeconds}
          closedFrames={overlay.closedFrames}
          offsetSeconds={overlay.offsetSeconds}
          radiusPercent={overlay.radiusPercent}
        />
      );
    case "spotlight":
      return (
        <SpotlightOverlay
          x={overlay.x}
          y={overlay.y}
          radiusX={overlay.radiusX}
          radiusY={overlay.radiusY}
          darkness={overlay.darkness}
          softness={overlay.softness}
          color={overlay.color}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "bigText":
      return (
        <BigTextOverlay
          text={overlay.text}
          x={overlay.x}
          y={overlay.y}
          size={overlay.size}
          color={overlay.color}
          subtitle={overlay.subtitle}
          align={overlay.align}
          plate={overlay.plate}
          plateColor={overlay.plateColor}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    case "calloutRing":
      return (
        <CalloutRingOverlay
          x={overlay.x}
          y={overlay.y}
          radiusX={overlay.radiusX}
          radiusY={overlay.radiusY}
          color={overlay.color}
          strokeWidth={overlay.strokeWidth}
          drawFrames={overlay.drawFrames}
          leaderX={overlay.leaderX}
          leaderY={overlay.leaderY}
          dashed={overlay.dashed}
          pulse={overlay.pulse}
        />
      );
    case "flash":
      return (
        <FlashOverlay
          atFrame={overlay.atFrame}
          color={overlay.color}
          attackFrames={overlay.attackFrames}
          releaseFrames={overlay.releaseFrames}
          intensity={overlay.intensity}
        />
      );
    case "processFlow":
      return (
        <ProcessFlowOverlay
          steps={overlay.steps}
          accentColor={overlay.accentColor}
          y={overlay.y}
          staggerFrames={overlay.staggerFrames}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
          idle={overlay.idle}
        />
      );
    default:
      return null;
  }
};
