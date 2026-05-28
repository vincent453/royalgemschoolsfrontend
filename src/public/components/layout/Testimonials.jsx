import { FaUser } from 'react-icons/fa'
import reviewImage1   from '../../../assets/img/review.png'
import teacher1       from '../../../assets/img/teacher1.jpeg'
import testimonial1   from '../../../assets/img/testimonial1.jpeg'
import testimonial2   from '../../../assets/img/testimonial2.jpeg'
import testimonial3   from '../../../assets/img/testimonial3.jpeg'
import testimonial4   from '../../../assets/img/testimonail4.jpeg'
import ReviewSlider   from '../ui/ReviewSlider'

const reviews = [
  {
    review: "Royal Gem Mathematical School has been more than an institution of learning. It has been a place of personal growth. The knowledge and values I have gained here, particularly the importance of being a lifelong learner, have shaped me into a better and more refined version of myself.",
    name: "Utitofon Ibanga",
    company: "Staff, Royal Gem Schools",
    avatar: testimonial1,
  },
  {
    review: "Nurturing our Gems while preparing to serve our nation, Nigeria",
    name: "Esther Chukwu",
    company: "Staff, Royal Gem Schools",
    avatar: testimonial2,
  },
  {
    review: "Since I joined RGMS, my time here has provided a solid foundation for growth. I have been stretched to grow more than in some other places I have worked before, and I have gained insight into using learning resources to teach better here.",
    name: "Ajani Emmanuel Olusegun",
    company: "Staff, Royal Gem Schools",
    avatar: testimonial3,
  },
    {
    review: "My stay at Royal Gem Mathematical Schools has been an exciting one filled with learning, fun and exhilarating experiences but not without challenges. Challenges that pushed me to think smarter, work harder, and discover strengths I never knew I had. For me, this is an opportunity for capacity building. The friendly/healthy work environment makes learning even more interesting. Greater values unleashed with every day that passes.All thanks to Royal Gem mathematical Schools.Indeed sometimes, 'Big' is not by size.",
    name: "Mr. Stephen Owoichoche Akor",
    company: "HOD, Secondary section",
    avatar: testimonial4,
  },
  {
    review: "My stay in RGMS since joining the workforce has been a wonderful learning experience. I have gained knowledge, support, and valuable teamwork skills. I appreciate the opportunity to grow and contribute to the organization.",
    name: "Ms Oluwanifemi Bello",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "My stay in RGNPS has been peaceful and happy. I have gained more patience in handling children and I've grown both as a teacher and as a person. I'm proud to contribute to the development of RG Schools.",
    name: "Miss Feyisola Deborah",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "My stay in RGMS has been a beautiful learning experience so far. I have enjoyed the supportive environment, teamwork, and the opportunity to contribute to the growth of the pupils.",
    name: "Miss Oluwagbemisola Ogunleye",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "My stay in Royal Gem Nur/Pry School has been filled with growth, learning, and beautiful experiences. Teaching here has been meaningful and impactful in so many ways.",
    name: "Miss Gift AbasiEma",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "Working at RGMS has been a truly transformative experience. It has continually challenged me to push beyond my comfort zone, uncover hidden strengths, and develop skills I never knew I possessed.",
    name: "Mrs Toyin Ajayi",
    company: "Head of Finance, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "Being part of RGMS has positively shaped my teaching career and strengthened my skills in classroom management, pupils' development, and working with a good team.",
    name: "Mrs Adewole",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "Working as a team mate in this assignment has been one of the most fulfilling experiences of my life. The parents, the staff, the children have all made me a better person.",
    name: "Mr. Michael Oyetayo",
    company: "HOS Ikorodu, Royal Gem Schools",
    avatar: <FaUser />,
  },
  {
    review: "I have worked with different schools and amassed a lot of experience, but the way you lead us is different from what I have experienced elsewhere. Long live Royal Gem Mathematical School Abuja.",
    name: "Mr. Jacob Adega",
    company: "Staff, Royal Gem Schools",
    avatar: teacher1,
  },
  {
    review: "It has been amazing working at RGMS, where I learn something new every day. For the first time in my career, I feel truly fulfilled and found peace of mind here.",
    name: "Miss Mary Attah",
    company: "Staff, Royal Gem Schools",
    avatar: <FaUser />,
  },
]

const Testimonials = () => {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 md:px-10 bg-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">

          {/* Left — image + heading */}
          <div className="w-full lg:w-[30rem] flex flex-col gap-4 md:gap-6 justify-center">
            <h2 className="font-jost font-bold
                           text-2xl sm:text-3xl md:text-4xl
                           text-gray-900
                           lg:pr-12">
              What Our Staff Say About Us
            </h2>
            <img
              src={testimonial3}
              alt="Staff Review"
              className="w-full
                         max-w-[320px] sm:max-w-full
                         mx-auto lg:mx-0
                         object-contain"
            />
          </div>

          {/* Right — slider */}
          <div className="w-full lg:w-1/2">
            <ReviewSlider reviews={reviews} />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Testimonials