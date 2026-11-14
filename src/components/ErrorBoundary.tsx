import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/** Errors caused by Google Translate / browser extensions mutating the DOM */
const isTranslateDomError = (msg: string): boolean => {
  const lower = msg.toLowerCase();
  return (
    lower.includes('removeChild') ||
    lower.includes('insertBefore') ||
    lower.includes('rendered more hooks') ||
    lower.includes('rendered fewer hooks') ||
    lower.includes('hooks') && lower.includes('render') ||
    lower.includes('the node to be removed is not a child') ||
    lower.includes('failed to execute') && lower.includes('child')
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);

    // Auto-recover from Google Translate / browser-extension DOM mutations
    // (up to 3 times before showing the error screen)
    if (isTranslateDomError(error.message) && this.state.retryCount < 3) {
      console.warn('[ErrorBoundary] DOM mutation error detected – auto-recovering...');
      setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }));
      }, 50);
    }
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('jyotish_profiles');
    } catch {}
    this.setState({ hasError: false, error: null, retryCount: 0 });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F2] dark:bg-[#0D0D0F] text-[#1A1816] dark:text-[#E5E1D8]">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-[#141418] border border-[#E5E1D8] dark:border-[#2A2A2E] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#C9A050]">Celestial Alignment Restored</h2>
            <p className="text-xs text-gray-500 dark:text-[#9E9A90] leading-relaxed">
              A temporary calculation anomaly occurred. Please click below to refresh and load your astrological dashboard cleanly.
            </p>
            {this.state.error && (
              <p className="text-[11px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg break-all text-left">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-[#C9A050] text-[#0D0D0F] font-bold text-xs hover:bg-[#D4AF37] transition flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
