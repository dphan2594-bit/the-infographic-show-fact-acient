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
