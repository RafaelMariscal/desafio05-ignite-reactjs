import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.logoPosition}>
        <Link href="/">
          <a>
            <img
              className={styles.logo}
              src="/assets/Logo.png"
              alt="logo" />
          </a>
        </Link>f
      </div>
    </header>
  )
}
