import Link from 'next/link'
import styles from './page.module.css'

export default function LandingPage() {
  return (
    <div className={styles.root}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>Reclama Pro</span>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLinkSecondary}>Iniciar sesión</Link>
          <Link href="/register" className={styles.navLinkPrimary}>Registrarse gratis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Gestión de reclamos para Pymes</div>
        <h1 className={styles.heroTitle}>
          Cada reclamo resuelto<br />es un cliente que vuelve
        </h1>
        <p className={styles.heroSubtitle}>
          Centraliza, organiza y responde los reclamos de tus clientes desde un solo lugar.
          Sin planillas, sin correos perdidos, sin caos.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/register" className={styles.ctaPrimary}>
            Empieza gratis hoy
          </Link>
          <Link href="/login" className={styles.ctaSecondary}>
            Ya tengo una cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📋</div>
          <h3 className={styles.featureTitle}>Todo en un panel</h3>
          <p className={styles.featureText}>
            Visualiza el estado de cada reclamo en tiempo real. Abiertos, en proceso,
            resueltos — sin perderte nada.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🔗</div>
          <h3 className={styles.featureTitle}>Link único por reclamo</h3>
          <p className={styles.featureText}>
            Tu cliente accede a su reclamo con un link personalizado, sin necesidad
            de crear cuenta. Simple para ellos, profesional para ti.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⭐</div>
          <h3 className={styles.featureTitle}>Mide tu reputación</h3>
          <p className={styles.featureText}>
            Recibe valoraciones de tus clientes al cerrar cada caso. Entiende qué
            funciona y dónde mejorar.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Reclama Pro — Hecho para Pymes que se toman en serio a sus clientes.</p>
      </footer>
    </div>
  )
}
