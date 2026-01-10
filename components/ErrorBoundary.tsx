'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // 忽略 AbortError
    if (error.name === 'AbortError' || error.message?.includes('signal is aborted')) {
      return { hasError: false, error: null }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 忽略 AbortError
    if (error.name === 'AbortError' || error.message?.includes('signal is aborted')) {
      return
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700">
          發生錯誤，請重新整理頁面
        </div>
      )
    }

    return this.props.children
  }
}
