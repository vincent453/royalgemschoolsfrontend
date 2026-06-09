import home from '../../../assets/img/homebg.png'
import StatCard from '../ui/RatingCard'
import { FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
    count: "20+",
    label: "Years of Excellence",
  },
];



const Hero = () => {
  const navigate = useNavigate();
  return (
    <div>
<section
  className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-evenly overflow-hidden mt-[2rem]"
  style={{ backgroundImage: `url(${home})` }}
>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/60 z-0"></div>

  {/* Content */}
  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6 md:px-14 w-full max-w-7xl mx-auto">

    {/* Text side */}
    <div className="flex-1 max-w-lg text-center lg:text-left">
      <h1 className="font-jost font-bold text-4xl md:text-5xl lg:text-[4rem] leading-tight text-white">
        <span className="text-[#f056f0]">
          Royal Gem Mathematical School
        </span>

        <h1 className="text-white">
          Nurturing to flourish
        </h1>
      </h1>

      <p className="mt-6 text-gray-200 text-lg font-dm-sans">
        Your description or subtitle goes here.
      </p>

   <div className="mt-8 flex gap-4 justify-center lg:justify-start">
  <button
    onClick={() => navigate("/admissions")}
    className="bg-[#f056f0] hover:bg-[#525fe1] text-white font-jost font-semibold py-3 px-8 transition-all duration-500"
  >
    Get Started
  </button>

  <button
    onClick={() => navigate("/about")}
    className="border border-white text-white font-jost font-semibold py-3 px-8 hover:border-[#f056f0] hover:text-[#f056f0] transition-all duration-300"
  >
    Learn More
  </button>
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
   <div className="grid grid-cols-1 mt-14 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:-mt-12 z-10 relative px-6 md:px-14">
  {stats.map((item, index) => (
    <StatCard
      key={index}
      icon={item.icon}
      count={item.count}
      label={item.label}
    />
  ))}
</div>
    </div>
  )
}

export default Hero