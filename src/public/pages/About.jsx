import { useEffect } from "react"
import Benefit from "../components/layout/Benefit"
import Navbar from "../components/layout/Navbar"
import Section from "../components/layout/Section"
import AboutUs from "../components/layout/AboutUs"
import owner from "../../assets/img/owner.jpeg"
import VideoPlayer from "../components/layout/VideoPlayer"
import videobg from "../../assets/img/video2.jpeg"
import { FaUserGraduate } from "react-icons/fa"
import StatCard from "../components/ui/RatingCard"
import MessionVission from "../components/layout/MessionVission"
import FounderProfile from "../components/layout/FounderProfile"
import Achievements from "../components/layout/Acheivement"
import Facilities from "../components/layout/Facilities"
import Footer from "../components/layout/Foooter"

import AOS from "aos"
import "aos/dist/aos.css"
import SEO from "../components/layout/SEO"

const About = () => {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
      offset: 80,
    })
  }, [])

  const stats = [
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "300+",
      label: "Academic Programs",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "1200+",
      label: "Students",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "50+",
      label: "Teachers",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "10+",
      label: "Years of Excellence",
    },
  ]

  return (
    <>
    <SEO
  title="About Royal Gem School"
  description="Learn about Royal Gem School, our vision, mission, values, and commitment to academic excellence."
  keywords="about royal gem school, school mission, school vision"
  url="https://royalgemschool.com/about"
/>
    <div className="overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div data-aos="fade-down">
        <Section />
      </div>

      {/* Benefits */}
      <div data-aos="fade-up">
        <Benefit />
      </div>

      {/* About */}
      <div data-aos="fade-right">
        <AboutUs image={owner} />
      </div>

      {/* Video */}
      <div data-aos="zoom-in">
        <VideoPlayer
          thumbnailImage={videobg}
          style={"px-[0rem] md:px-[0rem] py:px-[0rem]"}
        />
      </div>

      {/* Stats */}
      <div className="relative z-10">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
                     gap-6 mt-14 lg:-mt-12
                     px-4 sm:px-6 md:px-14"
        >
          {stats.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <StatCard
                icon={item.icon}
                count={item.count}
                label={item.label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div data-aos="fade-left">
        <MessionVission />
      </div>

      {/* Founder */}
      <div data-aos="fade-up">
        <FounderProfile
          image={owner}
          name="Dr. Oluwatoyin Ariyo-Ojeme"
          title="Founder & Executive Director"
          school="Royal Gem Nursery / Primary School"
          experience="30+"
          students="500+"
          years="20+"
        />
      </div>

      {/* Achievements */}
      <div data-aos="zoom-in-up">
        <Achievements />
      </div>

      {/* Facilities */}
      <div data-aos="fade-up">
        <Facilities />
      </div>

      {/* Footer */}
      <Footer />
      
    </div>
    </>
  )
}

export default About