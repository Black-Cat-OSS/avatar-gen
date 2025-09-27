import React from 'react'
import styles from './style.module.scss'

// This component demonstrates SCSS modules with TypeScript support
export const TestScssComponent: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1
        className={`${styles.container__header} ${styles['container__header--large']}`}
      >
        SCSS Module Test
      </h1>
      <div
        className={`${styles.container__content} ${styles['container__content--centered']}`}
      >
        <p>
          This component uses SCSS modules with TypeScript
          support!
        </p>
        <button className={styles.button}>
          Primary Button
        </button>
        <button
          className={`${styles.button} ${styles['button--secondary']}`}
        >
          Secondary Button
        </button>
      </div>
    </div>
  )
}

export default TestScssComponent
