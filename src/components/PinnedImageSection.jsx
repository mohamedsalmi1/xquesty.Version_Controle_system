import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Import local images
import image1 from '../assets/pinned imag/1.webp';
import image2 from '../assets/pinned imag/2.webp';
import image3 from '../assets/pinned imag/3.webp';
import image4 from '../assets/pinned imag/4.webp';

const PinnedImageSection = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Content sections with associated images
  const sections = [
    {
      id: 0,
      title: t('pinned.0.title', { defaultValue: "AI-Powered Matching" }),
      description: t('pinned.0.desc', { defaultValue: "Our advanced algorithms analyze your skills, preferences, and career goals to connect you with the perfect Job / Internship opportunities. No more endless scrolling through irrelevant listings." }),
      badge: t('pinned.0.badge', { defaultValue: "SKILLS VALIDATION" }),
      image: image1,
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 1,
      title: t('pinned.1.title', { defaultValue: "Direct Company Placement" }),
      description: t('pinned.1.desc', { defaultValue: "Skip the middleman. We work directly with top companies to place you in meaningful roles where you'll gain real-world experience and make lasting connections." }),
      badge: t('pinned.1.badge', { defaultValue: "SKILLS VALIDATION" }),
      image: image2,
      color: "from-green-500 to-teal-600"
    },
    {
      id: 2,
      title: t('pinned.2.title', { defaultValue: "Mentorship & Support" }),
      description: t('pinned.2.desc', { defaultValue: "Our team is available 24/7 to support job seekers at every step, ensuring you never feel alone in your journey." }),
      badge: t('pinned.2.badge', { defaultValue: "SKILLS VALIDATION" }),
      image: image3,
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      title: t('pinned.3.title', { defaultValue: "Career Development" }),
      description: t('pinned.3.desc', { defaultValue: "Access exclusive workshops, skill-building sessions, and networking events designed to accelerate your professional growth and expand your industry knowledge." }),
      badge: t('pinned.3.badge', { defaultValue: "SKILLS VALIDATION" }),
      image: image4,
      color: "from-purple-500 to-pink-600"
    }
  ];

  // Create scroll-based progress for each section
  const sectionProgress = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 1, 2, 3, 3]
  );

  useEffect(() => {
    const unsubscribe = sectionProgress.onChange((latest) => {
      const newActiveSection = Math.floor(latest);
      if (newActiveSection !== activeSection && newActiveSection >= 0 && newActiveSection < sections.length) {
        setActiveSection(newActiveSection);
      }
    });

    return () => unsubscribe();
  }, [sectionProgress, activeSection, sections.length]);

  return (
    <section ref={containerRef} className="relative bg-gray-50/50">
      {/* Desktop Layout - Hidden on mobile/tablet */}
      <div className="hidden lg:flex relative">
        {/* Left side - Scrolling text sections */}
        <div className="w-1/2 relative z-10">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              className="h-[60vh] flex items-center justify-center p-4 lg:p-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: false, margin: "-200px" }}
            >
              <div className="max-w-lg">
                <motion.div
                  className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${section.color} text-white text-sm font-medium mb-4`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {section.badge}
                </motion.div>
                
                <motion.h3
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {section.title}
                </motion.h3>
                
                <motion.p
                  className="text-lg text-gray-600 leading-relaxed"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {section.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right side - Sticky image area that pins only during this section */}
        <div className="w-1/2 relative">
          <div className="sticky top-0 h-screen flex items-center justify-center p-2">
            <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  className="absolute inset-2 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{
                    opacity: activeSection === index ? 1 : 0,
                    scale: activeSection === index ? 1 : 0.8,
                    rotateY: activeSection === index ? 0 : 90,
                    z: activeSection === index ? 0 : -100
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.6 },
                    rotateY: { duration: 0.8 }
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="block lg:hidden">
        <div className="container mx-auto px-4 py-8">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How StageQuest Works
          </motion.h2>
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className="flex flex-col space-y-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${section.color} text-white text-sm font-medium mb-4`}>
                    {section.badge}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{section.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PinnedImageSection;
