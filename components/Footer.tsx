'use client'

import Link from 'next/link'
import { BookOpen, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<Record<string, string | number>>({})

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setSettings(result.data)
        }
      })
      .catch(err => console.error('載入網站設定錯誤:', err))
  }, [])

  const siteName = (settings.site_name as string) || '生命應該是這樣的'
  const footerEmail = (settings.footer_email as string) || 'info@campuslecture.com'
  const footerPhone = (settings.footer_phone as string) || '(02) 1234-5678'
  const footerAddress = (settings.footer_address as string) || '台北市大安區'
  const footerDescription = (settings.footer_description as string) || '致力於連結專業講師與校園，為學生帶來啟發性的學習體驗。'
  
  const links = {
    navigation: [
      { name: '首頁', href: '/' },
      { name: '專欄', href: '/blog' },
      { name: '講師', href: '/lecturers' },
      { name: '邀約', href: '/lecture-request' },
    ],
    services: [
      { name: '講座規劃', href: '/services/planning' },
      { name: '講師媒合', href: '/lecturers' },
      { name: '教育資源', href: '/resources' },
      { name: '常見問題', href: '/faq' },
    ],
  }

  return (
    <footer className="bg-paper border-t-2 border-black">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-black text-paper flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-base sm:text-lg font-bold whitespace-nowrap">{siteName}</span>
            </Link>
            <p className="text-ink-muted text-sm leading-relaxed mb-6">
              {footerDescription}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink-muted">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                <a href={`mailto:${footerEmail}`} className="hover:text-black transition-colors">
                  {footerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                <a href={`tel:${footerPhone}`} className="hover:text-black transition-colors">
                  {footerPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                <span>{footerAddress}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">導覽</h4>
            <ul className="space-y-3">
              {links.navigation.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-black transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">服務</h4>
            <ul className="space-y-3">
              {links.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-black transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter CTA */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">訂閱電子報</h4>
            <p className="text-sm text-ink-muted mb-4">
              獲取最新講座資訊與教育觀點
            </p>
            <Link 
              href="#newsletter"
              className="inline-flex items-center gap-2 px-4 py-3 border-2 border-black text-sm font-medium uppercase tracking-wider hover:bg-black hover:text-paper transition-colors"
            >
              <Mail className="w-4 h-4" strokeWidth={1.5} />
              <span>立即訂閱</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-muted uppercase tracking-wider">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-ink-muted uppercase tracking-wider">
            <Link href="#" className="hover:text-black transition-colors">隱私政策</Link>
            <Link href="#" className="hover:text-black transition-colors">使用條款</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
