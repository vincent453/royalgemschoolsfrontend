import ImageTextSection from '../ui/ImageText'

const AboutUs = ({image}) => {
  return (
    <div>
<div className="flex flex-col lg:flex-row items-center gap-10 px-[1rem] py:px-[5rem] md:px-[5rem] py-12">
    <ImageTextSection 
      image={image}
      imageLeft={true}
      title="Brief History Of Our School"
      titleColor="text-[#f056f0]"
     paragraphs={[
     
      "Royal Gem Nursery/Primary School was founded in 2005 by Dr. Oluwatoyin Ariyo-Ojeme at Ajisebiaramecca Street, off Itoikin Road, Ikorodu. It began with a clear purpose: to give children a strong academic and moral foundation.",
      "The school relocated to Jubilee Estate in September 2006 and found its permanent home in Ayonnusi Estate in September 2008. From the beginning, Royal Gem became known for making Mathematics accessible, engaging, and enjoyable.",
      "In 2010, the vision expanded beyond the classroom with a strong focus on teacher development and capacity building. This led to the establishment of the Royal Gem Mathematical Foundation, created to provide free, on-the-job training for teachers in public schools. At the same time, Royal Gem Educational Services was established to provide professional training and development opportunities for teachers in private schools. Royal Gem Mathematical Schools, Abuja In 2021, the vision took another significant step forward with the establishment of Royal Gem Mathematical Schools, Abuja. This followed the resignation of the Chief Learning Officer from the University of Jos, where she had also established and managed a Mathematical Centre dedicated to the continuous professional development of teachers.The Mathematical Centre provided practical, on-the-job training for Nursery, Primary and Secondary School teachers, while also creating opportunities for undergraduates, postgraduates, and lecturers to develop valuable skills in data analysis. A Milestone of Excellence In 2025, Royal Gem Mathematical Schools, Abuja achieved full accreditation as a Basic Education Certificate Examination (BECE) centre. The outstanding examination results that followed provided a significant affirmation of the school’s educational approach—demonstrating that when learners are properly taught, guided and empowered, they can excel through their own knowledge and ability without assistance during examinations.Today, Royal Gem continues to build on this vision: developing teachers, empowering learners, and raising a generation equipped to learn, think, excel and make a lasting impact."
       />
</div>
    </div>
  )
}

export default AboutUs
