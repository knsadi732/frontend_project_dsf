import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-lg font-semibold text-text">Something went wrong</h1>
        <p className="max-w-md text-sm text-text-muted">{error.message || 'An unexpected error occurred while rendering this page.'}</p>
        <button
          type="button"
          onClick={() => {
            this.setState({ error: null });
            window.location.href = '/dashboard';
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }
}
