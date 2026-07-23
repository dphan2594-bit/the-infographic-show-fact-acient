import type { Overlay } from "../scenes/types";
import { ChapterTitleOverlay } from "./overlays/ChapterTitleOverlay";
import { DataBadgeOverlay } from "./overlays/DataBadgeOverlay";
import { IconLabelOverlay } from "./overlays/IconLabelOverlay";
import { DateHudOverlay } from "./overlays/DateHudOverlay";
import { CaptionOverlay } from "./overlays/CaptionOverlay";
import { StaggerBadgesOverlay } from "./overlays/StaggerBadgesOverlay";
import { ChartLineOverlay } from "./overlays/ChartLineOverlay";
import { ProcessFlowOverlay } from "./overlays/ProcessFlowOverlay";

export const OverlayRenderer: React.FC<{ overlay: Overlay }> = ({ overlay }) => {
  switch (overlay.type) {
    case "chapterTitle":
      return (
        <ChapterTitleOverlay
          title={overlay.title}
          subtitle={overlay.subtitle}
          accentColor={overlay.accentColor}
          entrance={overlay.entrance}
          delayFrames={overlay.delayFrames}
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
        />
      );
    case "dateHud":
      return <DateHudOverlay date={overlay.date} />;
    case "caption":
      return <CaptionOverlay text={overlay.text} />;
    case "staggerBadges":
      return (
        <StaggerBadgesOverlay
          items={overlay.items}
          accentColor={overlay.accentColor}
          staggerFrames={overlay.staggerFrames}
          entrance={overlay.entrance}
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
    case "processFlow":
      return (
        <ProcessFlowOverlay
          steps={overlay.steps}
          accentColor={overlay.accentColor}
          y={overlay.y}
          staggerFrames={overlay.staggerFrames}
        />
      );
    default:
      return null;
  }
};
