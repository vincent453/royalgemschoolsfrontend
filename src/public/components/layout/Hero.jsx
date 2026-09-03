import home from '../../../assets/img/homebg.png'
import { useNavigate } from "react-router-dom";


const Hero = () => {
  const navigate = useNavigate();
  return (
    <div>
<section
  className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-evenly overflow-hidden mt-[5.9rem] pb-12"
  style={{ backgroundImage: `url(${home})` }}
>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/60 z-0"></div>

  {/* Content */}
  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6 md:px-14 w-full max-w-7xl mx-auto">

    {/* Text side */}
    <div className="flex-1 max-w-lg text-center lg:text-left">
      <h1 className="font-jost font-bold text-4xl md:text-5xl lg:text-[4rem] leading-tight text-white">
        <span className="text-[#f056f0]">Royal Gem Schools</span>
        <span className="block text-white">Nurturing Confident, Excellent and Future-Ready Learners</span>
      </h1>

      <p className="mt-6 text-gray-200 text-lg font-dm-sans">
        Early Years, Primary and Secondary Education in Ikorodu and Abuja, built on academic excellence, strong moral values, creativity and practical skills.
      </p>

   <div className="mt-8 flex gap-4 justify-center lg:justify-start">
  <button
    onClick={() => navigate("/admissions")}
    className="bg-[#f056f0] hover:bg-[#525fe1] text-white font-jost font-semibold py-3 px-8 transition-all duration-500"
  >
    Apply for 2026/2027 Admission
  </button>

  <button
    onClick={() => navigate("/contact")}
    className="border border-white text-white font-jost font-semibold py-3 px-8 hover:border-[#f056f0] hover:text-[#f056f0] transition-all duration-300"
  >
    Book a School Tour
  </button>
</div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 lg:justify-start">
        <button onClick={() => navigate("/admissions#prospectus")} className="text-sm font-semibold text-white underline underline-offset-4 hover:text-[#f056f0]">
          Download Prospectus
        </button>
        <a href="https://wa.me/2347037199498" target="_blank" rel="noreferrer" className="text-sm font-semibold text-white underline underline-offset-4 hover:text-[#f056f0]">
          Chat with Admissions on WhatsApp
        </a>
      </div>
    </div>



  {/* Image side */}
  {/* <div className="flex-1 flex justify-center lg:justify-end">
    <img
      src={student}
      alt="Student"
      className="w-full max-w-sm lg:max-w-full object-contain"
    />
  </div> */}

</div>

        </section>
    </div>
  )
}

export default Hero