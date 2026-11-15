import React from "react";
import ReactPlayer from "react-player";

import { IconX } from "../icons";

/**
 * Full-screen video player for mobile viewports.
 *
 * Replaces the draggable PiP window on phones, where the fixed 640px
 * window (positioned via margin-left: 50%) covers the screen with its
 * close button off-screen and its z-index above the tab bar, making it
 * impossible to dismiss. Close via the X button or by tapping the
 * area around the video.
 */
interface MobileVideoPlayerProps {
  url: string;
  onClose: () => void;
}

const MobileVideoPlayer = ({ url, onClose }: MobileVideoPlayerProps) => (
  <div
    className="mobile-video-overlay"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Video player"
  >
    <div className="mobile-video-header">
      <span className="mobile-video-title">Now Playing</span>
      <button
        type="button"
        className="mobile-video-close"
        onClick={onClose}
        aria-label="Close video player"
      >
        <IconX size={22} />
      </button>
    </div>
    <div
      className="mobile-video-body"
      onClick={(e) => e.stopPropagation()}
    >
      <ReactPlayer controls={true} src={url} width="100%" height="100%" />
    </div>
  </div>
);

export default MobileVideoPlayer;
