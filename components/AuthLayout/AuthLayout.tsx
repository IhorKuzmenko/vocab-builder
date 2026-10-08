import Image from "next/image";

import Logo from "../Logo/Logo";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Logo />
        </header>

        <main className={styles.main}>
          <div className={styles.formContainer}>{children}</div>

          <div className={styles.illustrationContainer}>
            <Image
              src="/images/illustration@2x.png"
              alt="Two students reading books"
              width={498}
              height={435}
              priority
              className={styles.illustration}
            />
          </div>

          <p className={styles.caption}>
            Word <span>·</span> Translation <span>·</span> Grammar{" "}
            <span>·</span> Progress
          </p>
        </main>
      </div>
    </div>
  );
}
