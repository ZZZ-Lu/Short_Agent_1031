import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  componentStack: string;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  declare props: Readonly<AppErrorBoundaryProps>;
  declare state: AppErrorBoundaryState;
  declare setState: (
    state:
      | AppErrorBoundaryState
      | Partial<AppErrorBoundaryState>
      | ((prevState: Readonly<AppErrorBoundaryState>) => AppErrorBoundaryState | Partial<AppErrorBoundaryState>)
  ) => void;

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      componentStack: '',
    };
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message =
      error instanceof Error
        ? error.message || error.name || '未知渲染错误'
        : String(error || '未知渲染错误');
    return {
      hasError: true,
      errorMessage: message,
      componentStack: '',
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Uncaught UI runtime error:', error, info?.componentStack);
    const message =
      error instanceof Error
        ? error.message || error.name || '未知渲染错误'
        : String(error || '未知渲染错误');
    this.setState({
      hasError: true,
      errorMessage: message,
      componentStack: typeof info?.componentStack === 'string' ? info.componentStack : '',
    });
  }

  private handleRetryRender = () => {
    this.setState({
      hasError: false,
      errorMessage: '',
      componentStack: '',
    });
  };

  private handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        data-error-boundary="true"
        className="min-h-screen w-full bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 flex items-center justify-center p-6"
      >
        <div className="max-w-lg w-full rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              界面渲染遇到异常，已自动拦截以保护您的项目数据
            </h1>
            <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
              本地项目与画布数据未被清除，您可以尝试恢复当前视图或刷新页面。
            </p>
          </div>

          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 p-3 text-xs font-mono text-red-700 dark:text-red-300 break-words">
            {this.state.errorMessage || 'Unknown render error'}
          </div>

          {this.state.componentStack && (
            <details className="text-[11px] text-gray-500 dark:text-neutral-400">
              <summary className="cursor-pointer select-none font-medium hover:text-gray-700 dark:hover:text-neutral-200">
                查看组件调用栈
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-100 dark:bg-neutral-950 p-2.5 text-[10px] leading-snug whitespace-pre-wrap break-all">
                {this.state.componentStack.trim()}
              </pre>
            </details>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleRetryRender}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              尝试恢复视图
            </button>
            <button
              type="button"
              onClick={this.handleReloadPage}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }
}
