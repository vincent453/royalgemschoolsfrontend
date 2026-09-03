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
      "The vision expanded through teacher development, the Royal Gem Mathematical Foundation, and Royal Gem Mathematical Schools, Abuja, established in 2021. In 2025, the Abuja school received full accreditation as a Basic Education Certificate Examination Centre."
    ]}
    />
</div>
    </div>
  )
}

export default AboutUs