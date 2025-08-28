import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * Enhanced Error Boundary with user-friendly error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error for monitoring
    console.error('🚨 Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Could send to error tracking service here
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(console.error);
      } catch (e) {
        console.error('Failed to report error:', e);
      }
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-500/20 bg-black/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-red-500">Oops! Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>We encountered an unexpected error while loading this page.</p>
                <p className="text-xs mt-2 opacity-70">Error ID: {this.state.errorId}</p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-950/20 p-3 rounded border border-red-500/20">
                  <summary className="cursor-pointer text-sm text-red-400 mb-2">
                    Technical Details
                  </summary>
                  <div className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <div className="mt-2 text-red-400/70">
                        {this.state.error.stack}
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-retry"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  data-testid="button-home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for error boundary wrapping
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}