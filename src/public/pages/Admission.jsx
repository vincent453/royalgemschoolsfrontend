import { useEffect, useRef } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '../components/layout/Foooter'
import Navbar from '../components/layout/Navbar'
import bg from '../../assets/img/musicclass.jpeg'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/layout/SEO'

const Sparkle = ({ size = 16, color = '#f5c518', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
  </svg>
)

const Star = ({ style = {} }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={style}>
    <path
      d="M11 1l2.3 7.1H21l-6.2 4.5 2.4 7.1L11 15.2 4.8 19.7l2.4-7.1L1 8.1h7.7z"
      fill="#f5c518" stroke="#f5c518" strokeWidth="1" strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
    <circle cx="9" cy="9" r="9" fill="#A033A0" opacity="0.12" />
    <path d="M5 9l3 3 5-5" stroke="#A033A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const steps = [
  { num: '01', title: 'Submit Application', desc: "Complete our online or paper application form with your child's personal details, previous school records, and parent/guardian information.", icon: '📋' },
  { num: '02', title: 'Document Review', desc: 'Our admissions team reviews all submitted documents including birth certificates, last school report cards, and immunisation records.', icon: '🔍' },
  { num: '03', title: 'Entrance Assessment', desc: 'Shortlisted candidates sit a brief aptitude and literacy assessment to help us place students in the most suitable class level.', icon: '✏️' },
  { num: '04', title: 'Interview & Visit', desc: 'Parents and prospective students are invited for a guided school tour and a brief interview with our head of admissions.', icon: '🤝' },
  { num: '05', title: 'Offer Letter', desc: 'Successful candidates receive an official offer letter. A spot is secured upon payment of the acceptance fee within 14 days.', icon: '📨' },
  { num: '06', title: 'Enrolment & Resumption', desc: "Complete school fees payment, collect your child's uniform and textbook list, and prepare for the new term.", icon: '🎒' },
]

const requirements = [
  { label: 'Completed Application Form', note: 'Available at the school office or below' },
  { label: 'Birth Certificate (original + photocopy)', note: '' },
  { label: "Last two terms' school reports", note: 'Certified by previous school' },
  { label: 'Passport photographs (4 copies)', note: 'White background, recent' },
  { label: 'Immunisation / Health record card', note: '' },
  { label: 'Parent/Guardian valid ID', note: 'National ID, Passport or Driver\'s Licence' },
  { label: 'Proof of address', note: 'Utility bill not older than 3 months' },
  { label: 'Acceptance & Registration Fees', note: 'Non-refundable, see fee schedule' },
]

const faqs = [
  { q: 'When is the admissions window open?', a: 'We accept applications twice a year — before the first term (September) and before the third term (April). However, mid-year transfers are considered on a case-by-case basis subject to available spaces.' },
  { q: 'Is the entrance assessment compulsory?', a: 'Yes. All applicants from JSS 1 upward sit a short assessment. For Primary School entrants, a brief readiness evaluation is conducted with the child in a friendly, low-pressure setting.' },
  { q: 'Are there scholarships or bursaries available?', a: 'Royal Gem offers a merit-based scholarship for exceptional candidates entering JSS 1 and SSS 1. Bursary support is also available for families facing genuine financial hardship. Please enquire at the admissions office.' },
  { q: 'Can my child join mid-term?', a: "Mid-term entries are assessed individually. We aim to minimise disruption to your child's learning, so placements depend on class capacity and the outcome of the entrance assessment." },
  { q: 'How long does the admissions process take?', a: 'From submission of a complete application to receiving an offer letter typically takes 2–3 weeks during peak periods. Incomplete applications may cause delays.' },
]

export default function Admissions() {
  const faqRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 80 })
    faqRefs.current.forEach(r => { if (r) r.style.maxHeight = '0px' })
  }, [])

  const toggleFaq = (i) => {
    const el = faqRefs.current[i]
    const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px'
    faqRefs.current.forEach(r => { if (r) r.style.maxHeight = '0px' })
    if (!isOpen) el.style.maxHeight = el.scrollHeight + 'px'
  }

  return (
    <>
      <SEO
        title="Admissions | Royal Gem School"
        description="Apply for admission into Royal Gem School. Learn about admission requirements, procedures, and enrollment."
        keywords="school admission, royal gem admission, school registration"
        url="https://royalgemschool.com/admission"
      />

      {/* ── Navbar ── */}
      <div className="mt-24">
        <Navbar />
      </div>

      {/* ── Hero ── */}
      <div
        className="relative flex items-center justify-evenly overflow-hidden mt-8 px-[5%] py-16 md:py-20 text-center flex-col"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/80 z-0" />
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          {/* Decorative sparkles */}
          <Sparkle size={20} color="#f5c518" style={{ position: 'absolute', top: 40, left: '8%' }} />
          <Sparkle size={12} color="#A033A0" style={{ position: 'absolute', top: 100, left: '15%' }} />
          <Sparkle size={24} color="#f5c518" style={{ position: 'absolute', top: 60, right: '10%' }} />
          <Sparkle size={14} color="#A033A0" style={{ position: 'absolute', bottom: 80, right: '18%' }} />
          <Star style={{ position: 'absolute', bottom: 60, left: '12%' }} />

          {/* Badge */}
          <div data-aos="fade-down" data-aos-duration="600">
            <span className="inline-flex items-center gap-2 bg-[#A033A0]/10 border border-[#A033A0]/20 rounded-full px-4 py-1.5 text-[13px] font-semibold text-[#A033A0] mb-6">
              <svg width="14" height="14" fill="#A033A0" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
              </svg>
              2025/2026 Admissions — Now Open
            </span>
          </div>

          {/* Heading */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h1 className="font-extrabold text-white leading-tight mb-5 text-4xl sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Begin Your Child's<br />
              <span className="text-[#A033A0]">Extraordinary Journey</span>
            </h1>
          </div>

          {/* Subtext */}
          <div data-aos="fade-up" data-aos-delay="200">
            <p className="text-white text-sm sm:text-base leading-relaxed mb-9 max-w-xl mx-auto">
              Royal Gem Mathematical School offers a nurturing, academically rich environment
              where every student is empowered to discover their potential and thrive.
            </p>
          </div>

          {/* Buttons */}
          <div data-aos="fade-up" data-aos-delay="300">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center">
              <a href="#apply" className="bg-[#A033A0] text-white border-2 border-[#A033A0] rounded-full px-8 py-3 font-semibold text-sm hover:bg-[#7b1fa2] hover:border-[#7b1fa2] hover:-translate-y-0.5 transition-all duration-300 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Apply Now
              </a>
              <a href="#process" className="bg-transparent text-[#A033A0] border-2 border-[#A033A0] rounded-full px-8 py-3 font-semibold text-sm hover:bg-[#A033A0]/7 hover:-translate-y-0.5 transition-all duration-300 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                See Admission Process
              </a>
            </div>
          </div>

          {/* Stats */}
          <div data-aos="fade-up" data-aos-delay="400">
            <div className="flex flex-wrap justify-center gap-5 sm:gap-10 mt-14 pt-10 border-t border-[#A033A0]/20 w-full">
              {[
                { num: '300+', label: 'Happy Students' },
                { num: '1,200+', label: 'Alumni Network' },
                { num: '50+', label: 'Expert Teachers' },
                { num: '10+', label: 'Years of Excellence' },
              ].map((s, i) => (
                <div className="text-center min-w-[80px]" key={s.label} data-aos="zoom-in" data-aos-delay={450 + i * 80}>
                  <span className="block font-extrabold text-2xl sm:text-3xl text-[#A033A0]" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.num}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <section className="px-[5%] py-16 md:py-20">
        <div data-aos="fade-up">
          <span className="block text-center text-xs font-semibold text-[#A033A0] uppercase tracking-widest mb-3">Why Royal Gem?</span>
          <h2 className="text-center font-extrabold text-3xl sm:text-4xl text-[#1a1a2e] leading-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            A School That <span className="text-[#A033A0]">Truly Cares</span>
          </h2>
          <p className="text-center text-[#777] text-sm max-w-xl mx-auto leading-relaxed mb-14">
            We go beyond textbooks — building character, confidence, and critical thinking in every child.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { num: '01', icon: '🏅', title: 'Qualified Teachers', desc: "Certified educators dedicated to your child's academic and personal growth." },
            { num: '02', icon: '📚', title: 'Quality Education', desc: 'Up-to-date curriculum aligned with national and international standards.' },
            { num: '03', icon: '🌿', title: 'Moral Values', desc: 'We instil discipline, respect and integrity alongside academic achievement.' },
            { num: '04', icon: '🖥️', title: 'Modern Classrooms', desc: 'Smart boards, science labs and digital tools for 21st-century learning.' },
          ].map((c, i) => (
            <div
              key={c.num}
              className="bg-white border border-[#f0e0f0] rounded-2xl p-7 relative hover:border-[#A033A0] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(160,51,160,0.1)] transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <span className="absolute top-4 right-5 font-black text-5xl text-[#A033A0]/[0.08] leading-none select-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.num}</span>
              <span className="text-3xl mb-4 block">{c.icon}</span>
              <div className="font-bold text-[17px] text-[#1a1a2e] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.title}</div>
              <div className="text-sm text-[#777] leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admissions Process ── */}
      <section className="px-[5%] py-16 md:py-20 bg-gradient-to-br from-[#f8f0ff] to-[#fdf5ff]" id="process">
        <div data-aos="fade-up">
          <span className="block text-center text-xs font-semibold text-[#A033A0] uppercase tracking-widest mb-3">Step by Step</span>
          <h2 className="text-center font-extrabold text-3xl sm:text-4xl text-[#1a1a2e] leading-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Our <span className="text-[#A033A0]">Admissions Process</span>
          </h2>
          <p className="text-center text-[#777] text-sm max-w-xl mx-auto leading-relaxed mb-14">
            We've made our admissions journey simple and transparent. Here's exactly what to expect.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="bg-white border border-[#f0e0f0] rounded-2xl p-7 relative hover:border-[#A033A0] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(160,51,160,0.1)] transition-all duration-300"
              data-aos={i % 2 === 0 ? 'fade-right' : 'fade-left'}
              data-aos-delay={i * 80}
            >
              <span className="absolute top-4 right-5 font-black text-5xl text-[#A033A0]/[0.08] leading-none select-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.num}</span>
              <span className="text-3xl mb-4 block">{s.icon}</span>
              <div className="font-bold text-[17px] text-[#1a1a2e] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.title}</div>
              <div className="text-sm text-[#777] leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Important Dates banner ── */}
      <div className="py-12 sm:py-16 bg-white overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#A033A0] to-[#7b1fa2] rounded-none sm:rounded-3xl mx-0 sm:mx-[5%] px-[5%] py-12 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between"
          data-aos="zoom-in"
        >
          <div data-aos="fade-right" data-aos-delay="100" className="flex-1">
            <Sparkle size={14} color="#f5c518" style={{ marginBottom: 12 }} />
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>2025/2026 Key Dates</h2>
            <p className="text-sm text-white/75 max-w-sm leading-relaxed">
              Mark your calendar — don't miss the application windows for each term of the new academic year.
            </p>
            <p className="mt-4 text-sm text-white/85 leading-relaxed max-w-lg">
              Royal Gem Mathematical Schools continuously admits learners across various levels, provided they meet the entry requirements and demonstrate readiness to align with the school's academic and operational standards.
              <br /><br />
              Enrollment for each academic session remains open throughout the year, as we remain committed to nurturing excellence and helping every learner flourish academically and morally.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            {[
              { label: 'Term 1 Opens', val: '1 July 2025' },
              { label: 'Term 1 Closes', val: '15 Aug 2025' },
              { label: 'Term 2 Opens', val: '3 Nov 2025' },
              { label: 'Term 2 Closes', val: '10 Dec 2025' },
              { label: 'Resumption', val: '8 Sep 2025' },
            ].map((d, i) => (
              <div
                key={d.label}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-center"
                data-aos="flip-up"
                data-aos-delay={100 + i * 80}
              >
                <div className="text-[11px] text-white/65 uppercase tracking-wide">{d.label}</div>
                <div className="font-bold text-base text-white mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{d.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Requirements ── */}
      <section className="px-[5%] py-16 md:py-20" id="requirements">
        <div data-aos="fade-up">
          <span className="block text-center text-xs font-semibold text-[#A033A0] uppercase tracking-widest mb-3">Checklist</span>
          <h2 className="text-center font-extrabold text-3xl sm:text-4xl text-[#1a1a2e] leading-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Required <span className="text-[#A033A0]">Documents</span>
          </h2>
          <p className="text-center text-[#777] text-sm max-w-xl mx-auto leading-relaxed mb-14">
            Please ensure all documents are ready before starting your application to avoid delays.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {requirements.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white border border-[#f0e0f0] rounded-2xl px-5 py-4 hover:border-[#A033A0] transition-colors duration-200"
              data-aos="fade-up"
              data-aos-delay={i * 70}
            >
              <CheckIcon />
              <div className="flex-1">
                <div className="font-semibold text-sm text-[#1a1a2e]" style={{ fontFamily: "'Poppins', sans-serif" }}>{r.label}</div>
                {r.note && <div className="text-xs text-gray-400 mt-0.5">{r.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-[5%] py-16 md:py-20">
        <div data-aos="fade-up">
          <span className="block text-center text-xs font-semibold text-[#A033A0] uppercase tracking-widest mb-3">Got Questions?</span>
          <h2 className="text-center font-extrabold text-3xl sm:text-4xl text-[#1a1a2e] leading-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Frequently Asked <span className="text-[#A033A0]">Questions</span>
          </h2>
          <p className="text-center text-[#777] text-sm max-w-xl mx-auto leading-relaxed mb-14">
            Everything you need to know about joining the Royal Gem family.
          </p>
        </div>
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-[#ede0f5] rounded-2xl overflow-hidden hover:border-[#A033A0] transition-colors duration-200"
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              <button
                className="w-full bg-transparent border-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => toggleFaq(i)}
              >
                <span className="font-semibold text-[15px] text-[#1a1a2e]" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.q}</span>
                <span className="w-7 h-7 rounded-full shrink-0 bg-[#A033A0]/10 text-[#A033A0] flex items-center justify-center text-lg leading-none transition-transform duration-300">+</span>
              </button>
              <div
                className="overflow-hidden transition-all duration-[350ms] ease-in-out"
                style={{ maxHeight: 0 }}
                ref={el => faqRefs.current[i] = el}
              >
                <p className="px-6 pb-5 text-sm text-[#666] leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <div
        className="text-center px-[5%] py-24 bg-gradient-to-br from-[#f8f0ff] via-[#fff9e6] to-[#f3e8ff]"
        id="apply"
      >
        <div data-aos="zoom-in">
          <Sparkle size={18} color="#f5c518" style={{ display: 'inline-block', marginBottom: 16 }} />
          <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1a1a2e] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ready to Join the<br /><span className="text-[#A033A0]">Royal Gem Family?</span>
          </h2>
          <p className="text-sm text-[#777] max-w-sm mx-auto leading-relaxed mb-9">
            Take the first step towards your child's bright future.
            Our admissions team is ready to guide you through every step.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="150">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center">
            <a
              href="#"
              onClick={() => navigate('/')}
              className="bg-[#A033A0] text-white border-2 border-[#A033A0] rounded-full px-8 py-3 font-semibold text-sm hover:bg-[#7b1fa2] hover:border-[#7b1fa2] hover:-translate-y-0.5 transition-all duration-300 text-center"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Download Application Form
            </a>
            <a
              href="#"
              onClick={() => navigate('/contact')}
              className="bg-transparent text-[#A033A0] border-2 border-[#A033A0] rounded-full px-8 py-3 font-semibold text-sm hover:bg-[#A033A0]/7 hover:-translate-y-0.5 transition-all duration-300 text-center"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Contact Admissions Office
            </a>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="250"
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-7 justify-center items-center flex-wrap"
        >
          {[
            { icon: '📞', text: '08012345678' },
            { icon: '📧', text: 'admissions@royalgem.edu.ng' },
            { icon: '📍', text: '123 School Road, Lagos, Nigeria' },
          ].map(c => (
            <span key={c.text} className="flex items-center gap-2 text-sm text-[#666]">
              <span>{c.icon}</span>{c.text}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </>
  )
}