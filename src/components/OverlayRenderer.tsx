import type { Overlay } from "../scenes/types";
import { ChapterTitleOverlay } from "./overlays/ChapterTitleOverlay";
import { DataBadgeOverlay } from "./overlays/DataBadgeOverlay";
import { IconLabelOverlay } from "./overlays/IconLabelOverlay";
import { DateHudOverlay } from "./overlays/DateHudOverlay";
import { CaptionOverlay } from "./overlays/CaptionOverlay";

export const OverlayRenderer: React.FC<{ overlay: Overlay }> = ({ overlay }) => {
  switch (overlay.type) {
    case "chapterTitle":
      return (
        <ChapterTitleOverlay
          title={overlay.title}
          subtitle={overlay.subtitle}
          accentColor={overlay.accentColor}
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
        />
      );
    case "iconLabel":
      return <IconLabelOverlay label={overlay.label} x={overlay.x} y={overlay.y} />;
    case "dateHud":
      return <DateHudOverlay date={overlay.date} />;
    case "caption":
      return <CaptionOverlay text={overlay.text} />;
    default:
      return null;
  }
};
