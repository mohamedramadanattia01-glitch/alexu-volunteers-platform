import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught runtime error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 text-right animate-in fade-in" dir="rtl">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-900/95 border-2 border-rose-500/40 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {this.props.fallbackTitle || 'حدث تنبيه غير متوقع أثناء معالجة هذه الصفحة'}
                </h3>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  {this.props.fallbackMessage || 'تم تأمين التطبيق بنجاح ومنع توقف النظام. يمكنك استئناف العمل فوراً.'}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-rose-300/90 overflow-x-auto max-h-32 custom-scrollbar">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة والمتابعة</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <Home className="w-3.5 h-3.5 text-sky-400" />
                <span>تحديث الصفحة كاملة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
