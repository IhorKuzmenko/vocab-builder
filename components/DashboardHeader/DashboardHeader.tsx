"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Logo from "../Logo/Logo";
import styles from "./DashboardHeader.module.css";

type DashboardHeaderProps = {
  userName: string;
};

const navigation = [
  { label: "Dictionary", href: "/dictionary" },
  { label: "Recommend", href: "/recommend" },
  { label: "Training", href: "/training" },
];

function UserAvatar({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`${styles.avatar} ${inverted ? styles.avatarInverted : ""}`}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M4 21a8 8 0 0 1 16 0" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const firstName = userName.trim().split(/\s+/)[0] || "User";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const menuButton = menuButtonRef.current;

    document.body.style.overflow = "hidden";

    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-label="Close menu"]')
      ?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) return;

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      } else {
        menuButton?.focus();
      }
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }

      setIsMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                pathname === item.href ? styles.active : ""
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.userArea}>
          <span className={styles.userName}>{firstName}</span>
          <UserAvatar />

          <button
            type="button"
            className={styles.desktopLogout}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
            <span aria-hidden="true">→</span>
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="dashboard-mobile-menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className={styles.menuOverlay}>
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu backdrop"
            tabIndex={-1}
          />

          <aside
            ref={menuRef}
            id="dashboard-mobile-menu"
            className={styles.mobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className={styles.menuTop}>
              <div className={styles.menuUser}>
                <span className={styles.menuUserName}>{firstName}</span>
                <UserAvatar inverted />
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 5 19 19M19 5 5 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className={styles.mobileNav} aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileLink} ${
                    pathname === item.href ? styles.mobileActive : ""
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                className={styles.mobileLogout}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
                <span aria-hidden="true">→</span>
              </button>
            </nav>

            {logoutError && (
              <p className={styles.logoutError} role="alert">
                {logoutError}
              </p>
            )}

            <div className={styles.menuIllustration}>
              <Image
                src="/images/illustration@2x.png"
                alt=""
                fill
                sizes="(max-width: 767px) 320px, 420px"
                className={styles.illustrationImage}
              />
            </div>
          </aside>
        </div>
      )}

      {logoutError && !isMenuOpen && (
        <p className={styles.headerError} role="alert">
          {logoutError}
        </p>
      )}
    </header>
  );
}
