'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Gunakan custom fallback jika disediakan
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F3] to-[#F7E7CE]/30 p-6">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#C9A96E]/10 p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={32} />
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl text-[#3D342B] mb-2">
              Terjadi Kesalahan
            </h2>

            {/* Message */}
            <p className="text-body-sm text-[#6B5B5B]/70 mb-6 leading-relaxed">
              {this.state.error?.message || 'Terjadi kesalahan tak terduga saat memuat halaman ini.'}
            </p>

            {/* Error details (collapsible) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-gray-50 rounded-xl text-left">
                <p className="text-caption text-gray-500 font-mono break-all">
                  {this.state.error.stack?.slice(0, 200)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A96E] to-[#DCAE96] text-white rounded-2xl font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <RefreshCw size={16} />
                Muat Ulang
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#C9A96E]/30 text-[#6B5B5B] rounded-2xl font-semibold text-sm hover:bg-[#C9A96E]/5 transition-all duration-300"
              >
                <Home size={16} />
                Ke Beranda
              </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-caption text-[#6B5B5B]/40">
              Jika masalah berlanjut, silakan hubungi kami
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}