import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NavLink } from "react-router-dom";

import {
  IconAmpSpeaker,
  IconFretboard,
  IconMusic,
  IconPlay,
  IconSettings,
} from "../icons";

/**
 * Mobile navigation: slim sticky top bar (brand + account) and a fixed
 * bottom tab bar. Only rendered on mobile viewports (see useIsMobile);
 * the desktop .magic-nav is hidden via css/mobile.css.
 */
interface MobileNavProps {
  isConnected: boolean;
  enableSoundshedLogin: boolean;
  isUserSignedIn: boolean;
  userName?: string;
  onRequireSignIn: () => void;
  onSignOut: () => void;
}

const tabs: {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
  showStatus?: boolean;
}[] = [
  { to: "/", label: "Home", icon: IconMusic, exact: true },
  { to: "/device", label: "Amp", icon: IconAmpSpeaker, showStatus: true },
  { to: "/lessons", label: "Jam", icon: IconPlay },
  { to: "/scalex", label: "Toolkit", icon: IconFretboard },
  { to: "/settings", label: "Settings", icon: IconSettings },
];

const MobileTopBar = ({
  enableSoundshedLogin,
  isUserSignedIn,
  userName,
  onRequireSignIn,
  onSignOut,
}: MobileNavProps) => (
  <header className="mobile-topbar">
    <span className="mobile-topbar-brand">Soundshed</span>
    {enableSoundshedLogin ? (
      isUserSignedIn ? (
        <button
          type="button"
          className="mobile-account-btn"
          onClick={onSignOut}
          aria-label={`Signed in as ${userName}. Tap to sign out.`}
        >
          <FontAwesomeIcon icon={faUser} aria-hidden="true" />
          <span className="mobile-account-name">{userName}</span>
        </button>
      ) : (
        <button
          type="button"
          className="mobile-account-btn"
          onClick={onRequireSignIn}
          aria-label="Sign in"
        >
          <FontAwesomeIcon icon={faUser} aria-hidden="true" />
          <span className="mobile-account-name">Sign In</span>
        </button>
      )
    ) : null}
  </header>
);

const MobileTabBar = ({ isConnected }: MobileNavProps) => (
  <nav className="mobile-tabbar" aria-label="Main navigation">
    {tabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        end={tab.exact}
        className="mobile-tab"
      >
        <span className="mobile-tab-icon-wrap">
          <tab.icon size={22} />
          {tab.showStatus ? (
            <span
              className={
                "status-dot " + (isConnected ? "connected" : "disconnected")
              }
              aria-label={isConnected ? "Amp connected" : "Amp disconnected"}
              role="img"
            />
          ) : null}
        </span>
        <span className="mobile-tab-label">{tab.label}</span>
      </NavLink>
    ))}
  </nav>
);

const MobileNav = (props: MobileNavProps) => (
  <>
    <MobileTopBar {...props} />
    <MobileTabBar {...props} />
  </>
);

export default MobileNav;
