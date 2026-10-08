import React from 'react';
import { BrandBadgeMark } from './svg/BrandLogo';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#fbf9ef] text-[#171412] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-8 text-center">
            <div className="flex justify-center mb-4">
              <BrandBadgeMark className="w-14 h-14" />
            </div>
            <h1 className="font-display text-[32px] font-extrabold tracking-tight mb-3">
              Something went wrong.
            </h1>
            <p className="text-[15px] text-[#171412]/80 mb-6">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="min-h-[44px] px-6 py-2.5 rounded-[50px] bg-[#171412] text-[#fbf9ef] text-[13px] font-bold cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
