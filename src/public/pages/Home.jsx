import { useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"

import AboutUs from "../components/layout/AboutUs"
import Benefit from "../components/layout/Benefit"
import Hero from "../components/layout/Hero"
import Navbar from "../components/layout/Navbar"
import PopularCategory from "../components/layout/PopularCategory"
import VideoPlayer from "../components/layout/VideoPlayer"
import videobg from '../../assets/img/video.jpeg'
import OurTeachers from "../components/layout/OurTeachers"
import Testimonials from "../components/layout/Testimonials"
import Blog from "../components/layout/Blog"
import Footer from "../components/layout/Foooter"
import shapeimage from '../../assets/img/shape-image.png'
import SEO from "../components/layout/SEO"
import { Helmet } from "react-helmet-async"

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 80,
    })
  }, [])

  return (
    <>
          <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "School",
            name: "Royal Gem School",
            url: "https://royalgemschool.com",
            telephone: "+234XXXXXXXXXX",
            address: {
              "@type": "PostalAddress",
              streetAddress: "School Address",
              addressLocality: "Abuja",
              addressCountry: "NG"
            }
          })}
        </script>
      </Helmet>

<SEO
  title="Royal Gem School | Quality Education for Future Leaders"
  description="Royal Gem School provides quality nursery, primary, and secondary education with experienced teachers, modern learning facilities, and a nurturing environment."
  keywords="Royal Gem School, school in Nigeria, nursery school, primary school, secondary school, quality education, admission"
  image="https://royalgemschool.com/seo-image.jpg"
  url="https://royalgemschool.com"
/>
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero: fade up from bottom on load */}
      <div data-aos="fade-up">
        <Hero />
      </div>

      {/* Benefits: fade up with slight delay */}
      <div className="mt-20" data-aos="fade-up" data-aos-delay="100">
        <Benefit />
      </div>

      {/* About Us: slide in from the left */}
      <div data-aos="fade-right" data-aos-delay="150">
        <AboutUs image={shapeimage} />
      </div>

      {/* Popular Category: zoom in from center */}
      <div data-aos="zoom-in" data-aos-delay="100">
        <PopularCategory />
      </div>

      {/* Video Player: fade in from bottom */}
      <div data-aos="fade-up" data-aos-delay="100">
        <VideoPlayer thumbnailImage={videobg} />
      </div>

      {/* Our Teachers: slide in from the right */}
      <div data-aos="fade-left" data-aos-delay="100">
        <OurTeachers />
      </div>

      {/* Testimonials: flip up */}
      <div data-aos="flip-up" data-aos-delay="100">
        <Testimonials />
      </div>

      {/* Blog: fade up */}
      <div data-aos="fade-up" data-aos-delay="100">
        <Blog />
      </div>

      {/* Footer: subtle fade in */}
      <div data-aos="fade-in" data-aos-delay="50">
        <Footer />
      </div>
    </div>
    </>
  )
}

export default Home