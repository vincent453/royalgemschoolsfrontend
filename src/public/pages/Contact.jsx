import { useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"

import Navbar from "../components/layout/Navbar"
import Section from "../components/layout/Section"
import contactimg from '../../assets/img/blog2.jpeg'
import ContactInfo from "../components/ui/ContactInfo"
import ContactForm from "../components/ui/ContactForm"
import Footer from "../components/layout/Foooter"

const Contact = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 80,
    })
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* Navbar: no animation — always visible immediately */}
      <Navbar />

      {/* Hero banner: fade down from top */}
      <div data-aos="fade-down">
        <Section img={contactimg} title="Get In Touch With Us" description="Home/Contact" />
      </div>

      {/* Contact Info: slide in from the left */}
      <div data-aos="fade-right" data-aos-delay="100">
        <ContactInfo />
      </div>

      {/* Contact Form: slide in from the right */}
      <div data-aos="fade-left" data-aos-delay="150">
        <ContactForm />
      </div>

      {/* Footer: subtle fade in */}
      <div data-aos="fade-up" data-aos-delay="50">
        <Footer />
      </div>
    </div>
  )
}

export default Contact