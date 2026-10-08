import Link from "next/link";

import Icon from "../Icon/Icon";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="VocabBuilder home">
      <Icon name="logo" width={40} height={40} />
      <span>VocabBuilder</span>
    </Link>
  );
}
