import Link from "next/link";

import Logo from "../Logo/Logo";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />

        <Link href="/login" className={styles.loginLink}>
          Log in
        </Link>
      </div>
    </header>
  );
}
