import { Component } from 'react';
import EmptyState from './EmptyState.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('PULSE-19 render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <EmptyState
        icon={AlertTriangle}
        title="This section failed to load"
        description={`Something went wrong while drawing this page (${this.state.error.message}). Reload the page to try again.`}
        action={<Button onClick={() => window.location.reload()}>Reload page</Button>}
      />
    );
  }
}
