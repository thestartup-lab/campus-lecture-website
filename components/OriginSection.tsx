'use client'

import { motion } from 'framer-motion'
import { BookOpen, Heart, GraduationCap } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
}

function DropCap({ children }: { children: string }) {
  const firstLetter = children.charAt(0)
  const restOfText = children.slice(1)
  return (
    <p className="text-lg sm:text-xl leading-relaxed text-ink-light">
      <span className="float-left text-7xl sm:text-8xl font-serif font-black leading-[0.8] mr-3 mt-1 text-black">
        {firstLetter}
      </span>
      {restOfText}
    </p>
  )
}

export default function OriginSection() {
  return (
    <>
      {/* ===== Chapter 01：品牌歷程 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                計劃緣起
              </h2>
              <div className="w-24 h-1 bg-black" />
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 space-y-6">
                <DropCap>
                  自 2002 年起，我們在各大專院校播下領導力的種子。從中華康輔教育推廣協會啟程，到成立「競爭LEAD教育中心」的專業深耕。這二十多年來，我們培育出無數優秀的領導人才，受邀演講累積達上百所高中職與大專院校，足跡從校園跨入企業。無論走得再遠，我們始終掛念著那群正處於生命轉折點的孩子。2026 年，我們決定展開回饋校園的計劃，讓更多的孩子可以從覺察開始，追求卓越的人生。
                </DropCap>
              </div>

              <div className="lg:col-span-1">
                <div className="border-2 border-black p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="space-y-8">
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-2 w-4 h-4 border-2 border-black bg-white rounded-full" />
                      <div className="absolute left-2 top-2 w-0.5 h-full bg-black" />
                      <div>
                        <div className="font-serif text-2xl font-bold text-black mb-1">2002</div>
                        <div className="text-sm text-ink-muted uppercase tracking-wider">啟航</div>
                      </div>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-2 w-4 h-4 border-2 border-black bg-black rounded-full" />
                      <div>
                        <div className="font-serif text-2xl font-bold text-black mb-1">2026</div>
                        <div className="text-sm text-ink-muted uppercase tracking-wider">回饋計畫</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Chapter 02：我們可以做的事 ===== */}
      <section className="py-24 border-b-2 border-black bg-paper-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="mb-16 text-center">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Chapter 02
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                我們可以做的事
              </h2>
              <p className="text-lg text-ink-muted max-w-2xl mx-auto">三位一體的專業支持</p>
              <div className="w-24 h-1 bg-black mx-auto mt-6" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-6 h-6 text-black" strokeWidth={1.5} />,
                  title: '學生端',
                  items: [
                    { label: '生涯輔導', desc: '引導學生自我覺察，探索生命意義與未來方向。' },
                    { label: '職涯發展', desc: '接軌產業趨勢，建立職涯藍圖與卓越的人生態度。' },
                    { label: '團隊協作', desc: '透過領導力實踐，培養溝通、解決問題與共好的核心素養。' },
                  ],
                },
                {
                  icon: <BookOpen className="w-6 h-6 text-black" strokeWidth={1.5} />,
                  title: '教師端',
                  items: [
                    { label: '教學領導力賦能', desc: '提供專業成長路徑，讓每一位老師成為點燃學生生命的火種。' },
                    { label: '創新教學策略支援', desc: '協助教師發展多元教學方法，提升教學成效。' },
                    { label: '改變校園的專業成長', desc: '建立教師社群，共同推動校園變革。' },
                  ],
                },
                {
                  icon: <Heart className="w-6 h-6 text-black" strokeWidth={1.5} />,
                  title: '家長端',
                  items: [
                    { label: '親子溝通覺察引導', desc: '協助家長建立有效的親子溝通模式。' },
                    { label: '成長型思維建立', desc: '培養家長與孩子共同成長的思維模式。' },
                    { label: '家庭教育的長期支持', desc: '提供持續性的家庭教育資源與陪伴。' },
                  ],
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeInUp}
                  className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 border-2 border-black">{card.icon}</div>
                    <h3 className="font-serif text-2xl font-bold text-black">{card.title}</h3>
                  </div>
                  <ul className="space-y-4 text-ink-light">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-black font-bold mt-1">•</span>
                        <span>
                          <strong className="text-black">{item.label}：</strong>
                          {item.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Chapter 03：我們想要做的事 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Chapter 03
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                我們想要做的事
              </h2>
              <div className="w-24 h-1 bg-black" />
            </div>

            <div className="border-2 border-black bg-black text-paper p-12 sm:p-16 lg:p-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="max-w-4xl mx-auto text-center">
                <p className="font-serif text-3xl sm:text-4xl lg:text-5xl italic font-bold leading-relaxed">
                  改變校園，從老師開始。我們致力於培養教師的領導力，讓每一位老師成為點燃學生生命的火種。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 創辦人簽名 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-right"
          >
            <div className="inline-block">
              <p className="text-sm uppercase tracking-widest text-ink-muted font-bold mb-4">創辦人</p>
              <p
                className="font-serif text-3xl sm:text-4xl italic text-black mb-6"
                style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic' }}
              >
                李柏賢
              </p>
              <svg
                width="250"
                height="30"
                viewBox="0 0 250 30"
                className="ml-auto"
                style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))' }}
              >
                <path
                  d="M0 15 Q 40 8, 80 18 T 160 12 T 240 18 L 250 15"
                  stroke="black"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
