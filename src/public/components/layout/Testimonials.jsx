import reviewImage1 from '../../../assets/img/review.png'
import robot from '../../../assets/img/robot.png'
import ReviewSlider from '../ui/ReviewSlider'

const reviews = [
  {
    review: "Even though I have been here for a short time, teaching here has been a positive and rewarding experience so far. I work with dedicated staff who have made teaching at Royal Gem Mathematical School truly enjoyable.",
    name: "Mrs Eunice Okonofua",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "My stay in RGMS since joining the workforce has been a wonderful learning experience. I have gained knowledge, support, and valuable teamwork skills. I appreciate the opportunity to grow and contribute to the organization.",
    name: "Ms Oluwanifemi Bello",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "My stay in RGNPS has been peaceful and happy. I have gained more patience in handling children and I've grown both as a teacher and as a person. I'm proud to contribute to the development of RG Schools.",
    name: "Miss Feyisola Deborah",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "My stay in RGMS has been a beautiful learning experience so far. I have enjoyed the supportive environment, teamwork, and the opportunity to contribute to the growth of the pupils. I appreciate being part of a school that is committed to excellence and impact.",
    name: "Miss Oluwagbemisola Ogunleye",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "My stay in Royal Gem Nur/Pry School has been filled with growth, learning, and beautiful experiences. Teaching here has been meaningful and impactful in so many ways. The Gems continues to give me reasons to keep sailing with passion and dedication.",
    name: "Miss Gift AbasiEma",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "Working at RGMS has been a truly transformative experience. It has continually challenged me to push beyond my comfort zone, uncover hidden strengths, and develop skills I never knew I possessed. This journey has contributed immensely to both my personal and professional growth.",
    name: "Mrs Toyin Ajayi",
    company: "Head of Finance, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "Being part of RGMS has positively shaped my teaching career and strengthened my skills in classroom management, pupils' development, and working with a good team.",
    name: "Mrs Adewole",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "Working as a team mate in this assignment has been one of the most fulfilling experiences of my life. The parents, the staff, the children have all made me a better person and I look forward to adding more value to this organisation.",
    name: "Mr. Michael Oyetayo",
    company: "HOS Ikorodu, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "I have worked with different schools and amassed a lot of experience, but the way you lead us is different from what I have experienced elsewhere. You have given me room for more improvement and I do not take it for granted. Long live Royal Gem Mathematical School Abuja.",
    name: "Mr. Jacob Adega",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  },
  {
    review: "It has been amazing working at RGMS, where I learn something new every day and get the opportunity to put it into practice. For the first time in my career, I feel truly fulfilled and found peace of mind here. I have gained deeper knowledge in classroom management, effective teamwork, and the use of learning materials that make lessons more engaging.",
    name: "Miss Mary Attah",
    company: "Staff, Royal Gem Schools",
    avatar: robot
  }
]

const Testimonials = () => {
  return (
    <section className="py-16 px-[1rem] py:px-[5rem] md:px-[5rem] bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-14">

        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Left — image */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 justify-center">
           <h2 className="font-jost font-bold pr-[3rem] text-4xl md:text-4xl text-gray-900">
              What Our Students Say About Us
            </h2>
            <img
              src={reviewImage1}
              alt="Student Review"
              className="w-full max-w-full md:max-w-full object-contain"
            />
          </div>

          {/* Right — text + slider */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
           
            <ReviewSlider reviews={reviews} className="py-4" />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Testimonials