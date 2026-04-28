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

      {/* How it works */}
      <section className={styles.howSection}>
        <h2 className={styles.howTitle}>¿Cómo funciona?</h2>
        <p className={styles.howSubtitle}>
          De la queja al cierre en cuatro pasos — sin correos perdidos, sin caos.
        </p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>📋</div>
            <h3 className={styles.stepTitle}>Registra el reclamo</h3>
            <p className={styles.stepText}>
              El agente de la Pyme ingresa los datos del cliente y el detalle del
              reclamo desde el panel interno.
            </p>
          </div>
          <div className={styles.stepConnector} aria-hidden="true" />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>🔗</div>
            <h3 className={styles.stepTitle}>Comparte el link único</h3>
            <p className={styles.stepText}>
              El sistema genera automáticamente un link personalizado que se
              envía al cliente. Sin que el cliente tenga que crear una cuenta.
            </p>
          </div>
          <div className={styles.stepConnector} aria-hidden="true" />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>💬</div>
            <h3 className={styles.stepTitle}>El cliente hace seguimiento</h3>
            <p className={styles.stepText}>
              El cliente accede a su reclamo desde cualquier dispositivo, ve el
              estado actualizado y puede responder directamente.
            </p>
          </div>
          <div className={styles.stepConnector} aria-hidden="true" />
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepIcon}>⭐</div>
            <h3 className={styles.stepTitle}>Cierra y recibe valoración</h3>
            <p className={styles.stepText}>
              La Pyme cierra el caso. El cliente valora la atención. Tú acumulas
              datos reales para mejorar tu servicio.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Reclama Pro — Hecho para Pymes que se toman en serio a sus clientes.</p>
      </footer>
    </div>
  )
}
