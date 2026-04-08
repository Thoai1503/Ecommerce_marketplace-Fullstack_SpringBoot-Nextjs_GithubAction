import styles from "./loading.module.css";

export default function LoadingCheckout() {
  return (
    <div className={styles.checkoutLoading}>
      <div className={`${styles.ambient} ${styles.ambient1}`} />
      <div className={`${styles.ambient} ${styles.ambient2}`} />

      <div className={styles.container}>
        <header className={`${styles.headerCard} ${styles.pulseBorder}`}>
          <div className={`${styles.line} ${styles.title}`} />
          <div className={`${styles.line} ${styles.subtitle}`} />
          <div className={styles.steps}>
            <div className={`${styles.step} ${styles.stepActive}`} />
            <div className={styles.connector} />
            <div className={styles.step} />
            <div className={styles.connector} />
            <div className={styles.step} />
          </div>
        </header>

        <main className={styles.grid}>
          <section className={styles.leftCol}>
            <article className={`${styles.card} ${styles.pulseBorder}`}>
              <div className={`${styles.line} ${styles.sectionTitle}`} />
              <div className={styles.addressRow}>
                <div className={styles.avatar} />
                <div className={styles.grow}>
                  <div className={`${styles.line} ${styles.w60}`} />
                  <div className={`${styles.line} ${styles.w90}`} />
                  <div className={`${styles.line} ${styles.w75}`} />
                </div>
              </div>
            </article>

            <article className={`${styles.card} ${styles.pulseBorder}`}>
              <div className={`${styles.line} ${styles.sectionTitle}`} />
              {[1, 2].map((shop) => (
                <div className={styles.shopBlock} key={shop}>
                  <div className={`${styles.line} ${styles.shopTitle}`} />
                  {[1, 2].map((item) => (
                    <div className={styles.itemRow} key={`${shop}-${item}`}>
                      <div className={styles.thumb} />
                      <div className={styles.grow}>
                        <div className={`${styles.line} ${styles.w70}`} />
                        <div className={`${styles.line} ${styles.w40}`} />
                        <div className={`${styles.line} ${styles.w50}`} />
                      </div>
                      <div className={styles.priceCol}>
                        <div className={`${styles.line} ${styles.w80}`} />
                        <div className={`${styles.line} ${styles.w60}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </article>
          </section>

          <aside className={styles.rightCol}>
            <article
              className={`${styles.card} ${styles.pulseBorder} ${styles.sticky}`}
            >
              <div className={`${styles.line} ${styles.sectionTitle}`} />
              <div className={styles.summaryLines}>
                <div className={`${styles.line} ${styles.w90}`} />
                <div className={`${styles.line} ${styles.w75}`} />
                <div className={`${styles.line} ${styles.w85}`} />
                <div className={`${styles.line} ${styles.w100}`} />
              </div>
              <div className={styles.button} />
              <p className={styles.loadingText}>
                Dang tai thong tin thanh toan...
              </p>
            </article>
          </aside>
        </main>
      </div>
    </div>
  );
}
