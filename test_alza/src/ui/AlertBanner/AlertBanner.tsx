import styles from './AlertBanner.module.css'

export function AlertBanner(props: { tone: 'warning' | 'danger'; title: string; text: string }) {
  return (
    <div className={`${styles.banner} ${props.tone === 'warning' ? styles.warning : styles.danger}`}>
      <div className={styles.title}>{props.title}</div>
      <div className={styles.text}>{props.text}</div>
    </div>
  )
}
