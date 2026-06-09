import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import SectionHeader from "../ui/SectionHeader"
import teacher1 from '../../../assets/img/teacher1.jpeg'
import teacher2 from '../../../assets/img/testimonial1.jpeg'
import teacher3 from '../../../assets/img/testimonial2.jpeg'
import teacher4 from '../../../assets/img/testimonial3.jpeg'
import teacher5 from '../../../assets/img/head_ikorudu.jpeg'
import TeacherCard from "../ui/TeacherCard"

const teachers = [
   {
    image:       teacher5,
    name:        "Michael Oyetayo",
    subject:     "Head of School Royal Gem, Ikorodu",
    twitterUrl:  "/",
    facebookUrl: "/",
    linkedinUrl: "/",
  },
  {
    image:       teacher1,
    name:        "Mvendaga Jacob ADEGA",
    subject:     "HOD English Language Department",
    twitterUrl:  "/",
    facebookUrl: "/",
    linkedinUrl: "/",
  },
  {
    image:       teacher2,
    name:        "Utitofon Ibanga",
    subject:     "HOD Early Years Section",
    twitterUrl:  "/",
    facebookUrl: "/",
    linkedinUrl: "/",
  },
  {
    image:       teacher3,
    name:        "ESTHER CHUKWU",
    subject:     "English Teacher",
    twitterUrl:  "/",
    facebookUrl: "/",
    linkedinUrl: "/",
  },
  {
    image:       teacher4,
    name:        "AJANI EMMANUEL OLUSEGUN",
    subject:     "Examination Committee",
    twitterUrl:  "/",
    facebookUrl: "/",
    linkedinUrl: "/",
  },

  // ✅ Add more teachers here — the slider handles it automatically
];

const OurTeachers = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 3500, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="mt-[50px] md:mt-[80px] px-4 sm:px-8 md:px-14 py-10">
      <SectionHeader
        title="Our Staff and Teachers"
        description="Meet our dedicated and experienced teaching staff who are committed to providing quality education and nurturing the potential of every student."
      />

      {/* Slider Wrapper */}
      <div className="relative mt-10">

        {/* Prev Button */}
        <button
          onClick={scrollPrev}
          className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {teachers.map((teacher, index) => (
              <div
                key={index}
                className="flex-none w-[80%] sm:w-[45%] md:w-[30%] lg:w-[23%]"
              >
                <TeacherCard {...teacher} />
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={scrollNext}
          className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default OurTeachers