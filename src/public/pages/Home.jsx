import AboutUs from "../components/layout/layout/AboutUs"
import Benefit from "../components/layout/layout/Benefit"
import Hero from "../components/layout/layout/Hero"
import Navbar from "../components/layout/layout/Navbar"
import PopularCategory from "../components/layout/layout/PopularCategory"
import VideoPlayer from "../components/layout/layout/VideoPlayer"
import videobg from '../../assets/img/video.jpeg'
import OurTeachers from "../components/layout/layout/OurTeachers"
import Testimonials from "../components/layout/layout/Testimonials"
import Blog from "../components/layout/layout/Blog"
import Footer from "../components/layout/Foooter"
import shapeimage from '../../assets/img/shape-image.png'


const Home = () => {
  return (
    <div>

        <Navbar  />
        <Hero />
        <div className="mt-20">
        <Benefit />
        </div>
        <AboutUs image={shapeimage}  />
        <PopularCategory />
        <VideoPlayer thumbnailImage={videobg} />
        <OurTeachers />
        <Testimonials />
        <Blog />
        <Footer/>
    </div>
  )
}

export default Home