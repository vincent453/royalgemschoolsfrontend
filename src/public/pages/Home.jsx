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
  )
}

export default Home