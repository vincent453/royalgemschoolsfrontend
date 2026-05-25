import SectionHeader from "../ui/SectionHeader"
import teacher1 from '../../../assets/img/teacher1.jpeg'
import teacher2 from '../../../assets/img/testimonial1.jpeg'
import teacher3 from '../../../assets/img/testimonial2.jpeg'
import teacher4 from '../../../assets/img/testimonial3.jpeg'

import TeacherCard from "../ui/TeacherCard"

const teachers = [
  {
    image:      teacher1,
    name:       "Mvendaga Jacob ADEGA",
    subject:    "HOD English Language Department",
  
    twitterUrl: "/",
    facebookUrl:"/",
    linkedinUrl:"/",
  },
{  
    image:      teacher2,
    name:       "Utitofon Ibanga",
    subject:    "HOD Early Years Section",
    twitterUrl: "/",
    facebookUrl:"/",
    linkedinUrl:"/",    
    },  
    {
    image:      teacher3,
    name:       "ESTHER CHUKWU ",
    subject:    "English Teacher",
    
    twitterUrl: "/",
    facebookUrl:"/",
    linkedinUrl:"/",    
    },
    {
    image:      teacher4,
    name:       "AJANI EMMANUEL OLUSEGUN",
    subject:    "Examination Committee",
   
    twitterUrl: "/",
    facebookUrl:"/",
    linkedinUrl:"/",    
    }
]
const OurTeachers = () => {
  return (              
    <div className="mt-[50px] py:mt-[173px] px-[0rem] py:px-[5rem] md:px-[5rem]">
        <SectionHeader title="Our Teachers" description="Meet our dedicated and experienced teaching staff who are committed to providing quality education and nurturing the potential of every student." />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 md:px-14 py-14">
        {/* Teacher Cards */}
        {teachers.map((teacher, index) => (
          <TeacherCard key={index} {...teacher} />
        ))}
      </div>
    </div>
  )
}

export default OurTeachers