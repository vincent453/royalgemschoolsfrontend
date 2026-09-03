import { FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope, FaYoutube } from 'react-icons/fa'
import { FiArrowUp } from 'react-icons/fi'
import logo from '../../../assets/img/logo.png'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const aboutLinks = [
  { label: "About Royal Gem Schools", href: "/about" },
  { label: "Educational Services",    href: "/educational-services" },
  { label: "Admissions",              href: "/admissions" },
  { label: "Academics",               href: "/#academics" },
  { label: "Frequently Asked Questions", href: "/admissions#faq" },
  { label: "Privacy Policy",           href: "/privacy" },
  { label: "Safeguarding",             href: "/safeguarding" },
  { label: "Contact",                 href: "/contact" },
]



const contactInfo = [
  { icon: <FaMapMarkerAlt />, text: "Ikorodu: 15, Royal Gem Avenue, Ayonnusi Estate, off Sagamu Road, Lagos State", href: null },
  { icon: <FaMapMarkerAlt />, text: "Abuja: 6, Main Street, Suncity Estate, around Galadimawa, Abuja", href: null },
  { icon: <FaPhone />,        text: "+234 906 565 0959",                           href: "tel:+2349065650959" },
  { icon: <FaPhone />,        text: "+234 703 719 9498",                           href: "tel:+2347037199498" },
  { icon: <FaPhone />,        text: "+234 803 409 1055",                           href: "tel:+2348034091055" },
  { icon: <FaWhatsapp />,     text: "Contact Whatsapp",                            href: "https://wa.me/2347037199498", colored: true },
  { icon: <FaEnvelope />,     text: "school.royalgem@gmail.com",                    href: "mailto:school.royalgem@gmail.com" },
]

const socials = [
  { icon: <FaYoutube />,   href: "https://youtube.com/@royalgemschoolseducationalserv?si=R48f2L6yQ4xFBXvJ" },
  { icon: <FaFacebookF />, href: "https://www.facebook.com/royalgemschools" },
  { icon: <FaInstagram />, href: "http://www.instagram.com/royalgemschools" },
  { icon: <FaLinkedinIn />,href: "/" },
]



const Footer = () => {
      const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer className="bg-[#f6def873] pt-16 pb-0">
      <div className="max-w-7xl mx-auto px-6 md:px-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-14">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Royal Gem Logo" className="h-10 object-contain" />
              <span className="font-jost font-bold text-[1.7rem] text-gray-900">Royal Gem</span>
            </div>
            <p className="font-dm-sans text-gray-500 text-md leading-relaxed">
              Nurturing future leaders through quality education, strong moral values, and innovative learning experiences.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full border text-[1.2rem] border-gray-300 flex items-center justify-center
                             text-gray-500 hover:bg-[#f056f0] hover:text-white hover:border-[#f056f0]
                             transition-all duration-300 text-sm"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — About */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900  ">About Us</h4>
            <ul className="flex flex-col gap-2">
              {aboutLinks.map(({ label, href }, i) => (
                <li key={i}>
                  <Link
                    to={href}
                    className="font-dm-sans text-gray-500 text-sm hover:text-[#f056f0] transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Col 4 — Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900">Contact Info</h4>
            <ul className="flex flex-col gap-3">
              {contactInfo.map(({ icon, text, href, colored }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#f056f0] mt-0.5 shrink-0">{icon}</span>
                  {href ? (
                    <a
                      href={href}
                      className={`font-dm-sans text-md leading-snug transition-colors duration-300
                                  ${colored
                                    ? 'text-[#f056f0] hover:text-[#525fe1]'
                                    : 'text-gray-500 hover:text-[#525fe1]'} `}
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="font-dm-sans text-gray-500 text-md leading-snug">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Admissions */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900">Start Your Journey</h4>
            <p className="font-dm-sans text-gray-500 text-md leading-relaxed">
              Discover a strong foundation in academics, character, creativity and practical skills.
            </p>
            <Link
              to="/admissions#apply"
              className="flex items-center gap-3 bg-[#525fe1] hover:bg-[#f056f0] text-white
                         px-4 py-2.5 rounded-lg transition-colors duration-300 w-fit"
            >
              <span className="text-sm font-jost font-bold">Apply for Admission</span>
            </Link>
            <a href="https://wa.me/2347037199498" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2.5 rounded-lg transition-colors duration-300 w-fit">
              <FaWhatsapp /> <span className="text-sm font-jost font-bold">Chat on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-[#f3d2f7a4]">
        <div className="max-w-7xl mx-auto px-6 md:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} All Rights Reserved by{" "}
            <span className="font-bold text-gray-700">Royal Gem Schools</span>. 
            Built by{" "}
            <span className="font-bold text-gray-700">
              <a href="https://wa.me/2348067215570">Vincent Web and App Development</a>
            </span>
          </p>  

          {/* Scroll to top */}
             <button
            onClick={scrollToTop}
            className={`w-12 h-12 right-6 bottom-6 fixed z-50 rounded-full border-2 border-[#f056f0] text-[#f056f0]
                        flex items-center justify-center hover:bg-[#f056f0] hover:text-white
                        transition-all duration-300
                        ${showScroll
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <FiArrowUp className="text-sm" />
          </button>
        </div>
      </div>

    </footer>
  )
}

export default Footer