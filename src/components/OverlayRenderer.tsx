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
