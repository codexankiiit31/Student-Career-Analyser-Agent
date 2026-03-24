import React from 'react';

/**
 * ErrorBoundary — catches any unhandled React render errors and prevents
 * the entire app from crashing to a blank white screen.
 *
 * Usage: Wrap the root <App> with <ErrorBoundary>
 *
 * Error Boundaries MUST be class components (React limitation).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; swap for Sentry.captureException in production
    console.error('🚨 ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.subtitle}>
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.message && (
              <code style={styles.errorCode}>{this.state.message}</code>
            )}
            <button style={styles.button} onClick={this.handleReload}>
              🔄 Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Inter', sans-serif",
    padding: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    color: '#fff',
  },
  icon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 10px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 20px',
    lineHeight: 1.6,
  },
  errorCode: {
    display: 'block',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '12px',
    marginBottom: '24px',
    wordBreak: 'break-word',
    textAlign: 'left',
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
};

export default ErrorBoundary;
