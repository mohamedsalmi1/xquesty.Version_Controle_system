// FAQ data for the FAQ section
const faqs = [
  {
    question: (t) => t('faq.0.q', { defaultValue: "How can I get a job?" }),
    answer: (t) => t('faq.0.a', { defaultValue: "Create an account, start your interview, and XQuesty will match you with the perfect job opportunities." })
  },
  {
    question: (t) => t('faq.1.q', { defaultValue: "How do companies benefit from XQuesty?" }),
    answer: (t) => t('faq.1.a', { defaultValue: "Companies save time and money, hire the right people, and get access to top candidates efficiently." })
  },
  {
    question: (t) => t('faq.2.q', { defaultValue: "How does XQuesty work?" }),
    answer: (t) => t('faq.2.a', { defaultValue: "XQuesty uses advanced algorithms to match candidates with job opportunities based on their skills, preferences, and career goals." })
  },
  {
    question: (t) => t('faq.3.q', { defaultValue: "Why do I need to pass an interview first?" }),
    answer: (t) => t('faq.3.a', { defaultValue: "The interview helps us understand your skills, strengths, and preferences so we can find the best job match for you." })
  },
  {
    question: (t) => t('faq.4.q', { defaultValue: "Can XQuesty help with internships too?" }),
    answer: (t) => t('faq.4.a', { defaultValue: "Yes! We connect students and interns with opportunities that match their skills and goals." })
  },
  {
    question: (t) => t('faq.5.q', { defaultValue: "Can XQuesty reduce our recruitment costs?" }),
    answer: (t) => t('faq.5.a', { defaultValue: "Yes! By providing qualified candidates directly, you spend less on advertising, agencies, and lengthy recruitment processes." })
  },
  {
    question: (t) => t('faq.6.q', { defaultValue: "How fast will we receive candidate matches?" }),
    answer: (t) => t('faq.6.a', { defaultValue: "Once a candidate passes their interview, they are immediately matched with your job openings." })
  },
  {
    question: (t) => t('faq.7.q', { defaultValue: "Can we customize candidate criteria?" }),
    answer: (t) => t('faq.7.a', { defaultValue: "Yes, you can set specific requirements like skills, experience, location, and more to find the best candidates for your needs." })
  },
  {
    question: (t) => t('faq.8.q', { defaultValue: "How do we get started with XQuesty for our company?" }),
    answer: (t) => t('faq.8.a', { defaultValue: "To get started, simply contact our sales team or sign up on our website. We'll guide you through the onboarding process and help you set up your account." })
  }
];
import './i18n'; // Ensure i18n is initialized before any useTranslation usage
import React, { useState, useEffect, useRef } from "react"
import { useTranslation, Trans } from 'react-i18next';
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import ChatForm from "@/components/ChatForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Brain, Target, TrendingUp, Users, Network, BookOpen, MessageCircle, UserCheck } from "lucide-react"
import { Footer } from "./components/Footer"
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import RecruiterAccess from "./components/RecruiterAccess"
import StudentAccess from "./components/StudentAccess"
import HelloS from "./pages/HelloS"
import InterviewSystem from "./pages/interview";
import HRMatchingPage from './pages/helloR';
import PinnedImageSection from './components/PinnedImageSection';
import sqLogo from './assets/xQuesty_logo.png';
//import { AuthProvider } from './contexts/AuthContext';
//import { recruiterSupabase as supabase } from "../lib/supabaseClient";

// Import partner logos
import partner1 from './assets/partner1.png';
import partner2 from './assets/partner2.png';
import partner3 from './assets/partner3.png';
import partner4 from './assets/partner4.png';
import partner5 from './assets/partner5.png';
import partner6 from './assets/partner6.png';
import partner7 from './assets/partner7.png';
import partner8 from './assets/partner8.png';
import partner9 from './assets/partner9.png';
import partner10 from './assets/partner10.png';

const partners = [
  [
    partner1,
    partner2,
    partner3,
    partner4,
    partner5,
    partner6,
    partner7,
    partner8,
    partner9,
    partner10,
  ],
  [
    partner4,
    partner7,
    partner8,
    partner9,
    partner10,
    partner1,
    partner5,
    partner3,
    partner2,
    partner6,
  ]
]

export default function App() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false)
  const videoRef = useRef(null)
  const controls = useAnimation()
  const [isHovering, setIsHovering] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // FAQ state must be above first usage
  const [showAllFAQ, setShowAllFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  // Slider state for feature boxes
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const navigate = useNavigate();

  // Feature data for the slider
  const features = [
    {
      id: 'smart-matching',
      title: (t) => t('features.automated_workflows.title', { defaultValue: 'Automated Workflows' }),
      icon: Brain,
      description: (t) => t('features.automated_workflows.desc', { defaultValue: 'With XQuesty’s AI solution, companies save time on hiring while job seekers get faster opportunities. No more wasted effort—just the right match, instantly.' })
    },
    {
      id: 'direct-placement',
      title: (t) => t('features.direct_placement.title', { defaultValue: 'Direct Placement' }),
      icon: Target,
      description: (t) => t('features.direct_placement.desc', { defaultValue: 'XQuesty’s AI-powered solution doesn’t just show you listings—we place you directly inside companies. Our exclusive partnerships deliver real jobs and internships with guaranteed mentorship and meaningful projects.' })
    },
    {
      id: 'end-to-end',
      title: (t) => t('features.end_to_end.title', { defaultValue: 'End-to-End Support' }),
      icon: Users,
      description: (t) => t('features.end_to_end.desc', { defaultValue: 'We provide fast, reliable support at every stage—helping companies hire efficiently while guiding job seekers and interns with the tools and advice they need to succeed.' })
    },
    {
      id: 'industry-network',
      title: (t) => t('features.industry_network.title', { defaultValue: 'Your Gateway to Exclusive Roles' }),
      icon: Network,
      description: (t) => t('features.industry_network.desc', { defaultValue: 'Gain access to jobs that aren\'t publicly advertised. Our network of industry partners trusts us to send them top talent, giving you access to premium opportunities.' })
    },
    {
      id: 'Backed by science',
      title: (t) => t('features.hire_confidence.title', { defaultValue: 'Hire with Confidence' }),
      icon: BookOpen,
      description: (t) => t('features.hire_confidence.desc', { defaultValue: 'Goodbye gut feeling, hello AI-driven decisions. xQuesty’s science-backed evaluations help you more accurately predict job performance, so you can hire with confidence and build stronger teams.' })
    },
    {
      id: 'alumni-network',
      title: (t) => t('features.save_time_money.title', { defaultValue: 'Save Time and Money' }),
      icon: UserCheck,
      description: (t) => t('features.save_time_money.desc', { defaultValue: 'xQuesty helps companies hire smarter by reducing the time and money spent on recruitment. Our data-driven evaluations quickly identify the best candidates, so you can make confident decisions, minimize hiring mistakes, and focus your resources where they matter most.' })
    }
  ];

  const toggleFeature = (featureId) => {
    setExpandedFeature(expandedFeature === featureId ? null : featureId);
  };

  const nextSlide = () => {
    const maxSlideIndex = features.length - 3.7; // Show fewer boxes at a time due to larger width
    setCurrentSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleMouseMove = (e) => {
    if (!videoRef.current) return
    const { left, top, width, height } = videoRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    controls.start({
      rotateY: -x * 6,
      rotateX: y * 6,
      x: -x * 5,
      y: -y * 5,
      scale: 1.03,
      transition: { type: "spring", stiffness: 80, damping: 12 }
    })
  }

  const handleMouseLeave = () => {
    controls.start({
      rotateY: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    })
    setIsHovering(false)
  }
  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group" style={{ textDecoration: 'none' }}>
              <img
                alt="xQuesty Logo"
                className="h-8 w-auto transition-transform group-hover:scale-105"
                src={sqLogo}
                style={{ minWidth: 32 }}
              />
            </Link>
            <nav className="hidden md:flex items-center gap-10 ml-10">
              <Link to="/recruiter" className="text-foreground/80 hover:text-foreground">recruiter space</Link>
              <Link to="/student" className="text-foreground/80 hover:text-foreground">student space</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* <Button
              onClick={() => setShowForm(true)}
              className="button-gradient hidden sm:flex"
            >
              Get Started
            </Button> */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-white"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">

                <Link 
                  to="/recruiter" 
                  className="text-foreground/80 hover:text-foreground p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recruiter Space
                </Link>
                <Link 
                  to="/student" 
                  className="text-foreground/80 hover:text-foreground p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Student Space
                </Link>

                {/* <Button
                  onClick={() => {
                    setShowForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="button-gradient w-full sm:hidden"
                >
                  Get Started
                </Button> */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="min-h-screen pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Hero Section */}
                <section className="container mx-auto px-4 pt-20 sm:pt-28 pb-8 sm:pb-16 text-center">
                  <motion.h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    dir="auto"
                  >
                    <Trans i18nKey="hero.title" components={{ 1: <span className="gradient-text" /> }}>
                      Leave it to <span className="gradient-text">xQuesty</span>
                    </Trans>
                  </motion.h1>
                  <motion.p
                    className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    dir="auto"
                  >
                    {t('hero.subtitle', { defaultValue: "Tired of searching for jobs? our AI connects you directly with real jobs and internships at real companies, You’re not searching, you’re building your future." })}
                  </motion.p>
                  {/* We don't offer listings. we place you inside. Real jobs & internships, real companies, real experience. You're not browsing. You're building. */}



                  {/* youtube video in the home page */}
                  {/*
                  <motion.div
                    className="youtube-container mb-8"
                    ref={videoRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    animate={controls}
                    style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                  >
                    {isPlaying ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/eij1r7Zfbz4"
                        title="xQuesty Introduction"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-2xl"
                      />
                    ) : (
                      <div
                        className="relative w-full h-full cursor-pointer rounded-2xl overflow-hidden"
                        onClick={handlePlayClick}
                      >
                        <img
                          src="https://img.youtube.com/vi/6nGM37ThEsU/maxresdefault.jpg"
                          alt="Video Thumbnail"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-20 h-20 text-white hover:text-gray-300 transition-colors"
                            fill="currentColor"
                            viewBox="0 0 84 84"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="18" y="18" width="48" height="48" fill="white" rx="12" ry="12" />
                            <circle opacity="0.9" cx="42" cy="42" r="36" fill="black" />
                            <polygon points="35,25 58,42 35,59" fill="white" rx="4" ry="4" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  */}



                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {/* <Button 
                      onClick={() => setShowForm(true)}
                      className="button-gradient text-lg px-8 py-6 rounded-full"
                    >
                      Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                    </Button> */}
                  </motion.div>
                </section>




                {/* Partners Section */}
                {/*
                <section className="py-6 sm:py-16 overflow-hidden">
                  <h2 className="text-base sm:text-xl text-center text-muted-foreground mb-4 sm:mb-8">
                    Trusted by Leading Companies
                  </h2>
                  <div className="relative max-w-7xl mx-auto px-4">
                    <div className="overflow-hidden relative w-full">
                      <div className="flex">
                        <div className="partners-scroll">
                          {[...partners[0], ...partners[0], ...partners[0]].map((src, idx) => (
                            <img
                              key={idx}
                              alt={`Partner company ${idx + 1}`}
                              src={src}
                              className="h-12 sm:h-16 w-auto max-w-full rounded-lg opacity-80 hover:opacity-100 transition-opacity mx-4 sm:mx-8 object-contain"
                              style={{ minWidth: '60px', maxHeight: '64px' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden relative w-full mt-8">
                      <div className="flex">
                        <div className="partners-scroll-reverse">
                          {[...partners[1], ...partners[1], ...partners[1]].map((src, idx) => (
                            <img
                              key={idx}
                              alt={`Partner company ${idx + 6}`}
                              src={src}
                              className="h-12 sm:h-16 w-auto max-w-full rounded-lg opacity-80 hover:opacity-100 transition-opacity mx-4 sm:mx-8 object-contain"
                              style={{ minWidth: '60px', maxHeight: '64px' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                */ }



                {/* How StageQuest Works Section */}
                <section className="py-8 sm:py-16">
                  <div className="container mx-auto px-4 text-center mb-8">
                    <motion.h2
                      className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      dir="auto"
                    >
                      {t('how_works.title', { defaultValue: 'How xQuesty Works' })}
                    </motion.h2>
                    <motion.p
                      className="text-lg text-gray-600 max-w-2xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      dir="auto"
                    >
                      {t('how_works.subtitle', { defaultValue: 'Discover the step-by-step process that transforms your Job / Internship search into a guaranteed placement' })}
                    </motion.p>
                  </div>
                  <PinnedImageSection />
                </section>
                
                {/* What Makes StageQuest Unique - Horizontal Slider */}
                <section className="container mx-auto px-4 py-8 sm:py-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto"
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 font-outfit" dir="auto">
                      <Trans i18nKey="unique.title" components={{ 1: <span className="text-blue-600 hover:text-black transition-colors cursor-pointer" /> }}>
                        What makes xQuesty <span className="text-blue-600 hover:text-black transition-colors cursor-pointer">unique</span>?
                      </Trans>
                    </h1>

                    {/* Slider Container */}
                    <div className="relative overflow-hidden max-w-6xl mx-auto">
                      <motion.div
                        className="flex gap-4"
                        animate={{ 
                          x: `${-currentSlideIndex * (expandedFeature ? 320 : 304)}px` 
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.8
                        }}
                        drag="x"
                        dragConstraints={{ 
                          left: -(features.length - 3) * 304, 
                          right: 0 
                        }}
                        dragElastic={0.1}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = swipePower(offset.x, velocity.x);
                          if (swipe < -swipeConfidenceThreshold) {
                            nextSlide();
                          } else if (swipe > swipeConfidenceThreshold) {
                            prevSlide();
                          }
                        }}
                      >
                        {features.map((feature, index) => {
                          const IconComponent = feature.icon;
                          const isExpanded = expandedFeature === feature.id;
                          const isVisible = index >= currentSlideIndex && index < currentSlideIndex + 3;
                          
                          return (
                            <motion.div
                              key={feature.id}
                              className="flex-shrink-0"
                              initial={false}
                              animate={{ 
                                width: isExpanded ? "600px" : "300px",
                                scale: isVisible ? 1 : 0.95,
                                opacity: isVisible ? 1 : 0.7
                              }}
                              transition={{ 
                                type: "spring",
                                stiffness: 400,
                                damping: 35,
                                mass: 0.6
                              }}
                              whileHover={{ 
                                y: -4,
                                transition: { 
                                  type: "spring", 
                                  stiffness: 400, 
                                  damping: 25 
                                }
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div 
                                className={`h-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer ${
                                  isExpanded ? 'shadow-2xl ring-2 ring-blue-100' : 'hover:shadow-xl'
                                }`}
                                onClick={() => toggleFeature(feature.id)}
                              >
                                <div className="p-6 h-full flex flex-col">
                                  {/* Icon */}
                                  <motion.div 
                                    className="flex justify-center mb-6"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  >
                                    <div className={`p-4 rounded-full transition-all duration-300 ${
                                      isExpanded ? 'bg-blue-200' : 'bg-blue-100'
                                    }`}>
                                      <IconComponent className={`h-10 w-10 transition-colors duration-300 ${
                                        isExpanded ? 'text-blue-700' : 'text-blue-600'
                                      }`} />
                                    </div>
                                  </motion.div>
                                  
                                  {/* Title */}
                                  <h3 className="text-xl font-bold text-gray-900 text-center mb-6 leading-tight">
                                    {feature.title(t)}
                                  </h3>
                                  
                                  {/* Content Area */}
                                  <div className="flex-1 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                      {!isExpanded ? (
                                        <motion.div
                                          key={`collapsed-${feature.id}`}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          transition={{ 
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25
                                          }}
                                          className="text-center"
                                        >
                                          <button 
                                            className="text-blue-600 hover:text-blue-700 font-bold text-lg transition-all duration-200 underline hover:no-underline transform hover:scale-105" 
                                            dir="auto"
                                          >
                                            {t('features.learn_more', { defaultValue: 'Learn More' })}
                                          </button>
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          key={`expanded-${feature.id}`}
                                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                          transition={{ 
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            delay: 0.1
                                          }}
                                          className="text-left"
                                        >
                                          <p className="text-gray-600 leading-relaxed text-base font-medium">
                                            {feature.description(t)}
                                          </p>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center items-center mt-8 gap-4">
                      <motion.button
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                        whileHover={currentSlideIndex !== 0 ? { scale: 1.05 } : {}}
                        whileTap={currentSlideIndex !== 0 ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-full shadow-lg transition-all duration-200 border border-gray-200 ${
                          currentSlideIndex === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:shadow-xl'
                        }`}
                        aria-label="Previous feature"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </motion.button>
                      
                      {/* Slide Indicators */}
                      <div className="flex gap-2">
                        {Array.from({ length: Math.max(1, features.length - 2) }, (_, i) => (
                          <motion.button
                            key={i}
                            onClick={() => setCurrentSlideIndex(i)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i === currentSlideIndex 
                                ? 'bg-blue-600 w-6' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>
                      
                      <motion.button
                        onClick={nextSlide}
                        disabled={currentSlideIndex === features.length - 3}
                        whileHover={currentSlideIndex !== features.length - 3 ? { scale: 1.05 } : {}}
                        whileTap={currentSlideIndex !== features.length - 3 ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-full shadow-lg transition-all duration-200 border border-gray-200 ${
                          currentSlideIndex === features.length - 3
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:shadow-xl'
                        }`}
                        aria-label="Next feature"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.button>
                    </div>

                    {/* Mobile-friendly touch indicators */}
                    <div className="flex justify-center mt-4 md:hidden">
                      <p className="text-sm text-gray-500">
                        {t('unique.mobile_hint', { defaultValue: 'Tap a box to learn more • Swipe or use arrows to navigate' })}
                      </p>
                    </div>
                  </motion.div>
                </section>

                {/* Add these helper functions and constants to your component */}
                {/* Swipe helper functions/constants for feature slider */}
                {/* Place these at the top-level of your App component */}



                {/* About */}
                <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" dir="auto">
                    {t('about.title', { defaultValue: 'About xQuesty' })}
                  </h2>
                  <p className="max-w-2xl mx-auto text-base sm:text-lg mb-6 sm:mb-8 px-2" dir="auto">
                    {t('about.desc', { defaultValue: 'xQuesty uses advanced AI solutions to streamline job matching, making it fast and simple for candidates to find the right role, while empowering HR teams to make data-driven hiring decisions, cut recruitment costs, and save valuable time.' })}
                  </p>
                </section>
                {/* FAQ */}
                <section className="container mx-auto px-4 py-8 sm:py-16">
                  <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
                    <span className="text-lg font-semibold text-left" dir="auto">
                      {t('faq.title', { defaultValue: 'Top questions' })}
                    </span>
                    <button
                      className="text-rose-500 font-semibold focus:outline-none underline"
                      onClick={() => setShowAllFAQ((prev) => !prev)}
                    >
                      {showAllFAQ
                        ? t('faq.view_less', { defaultValue: 'View less' })
                        : t('faq.view_more', { defaultValue: 'View more' })}
                    </button>
                  </div>
                  <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                    {(showAllFAQ ? faqs : faqs.slice(0, 4)).map((faq, idx) => {
                      const realIdx = showAllFAQ ? idx : idx;
                      return (
                        <Card key={realIdx}>
                          <button
                            className="w-full text-left flex items-center justify-between p-6 focus:outline-none"
                            onClick={() => setExpandedFAQ(realIdx === expandedFAQ ? null : realIdx)}
                            aria-expanded={expandedFAQ === realIdx}
                          >
                            <span className="font-semibold text-lg" dir="auto">{faq.question(t)}</span>
                            <span className="ml-4">
                              {expandedFAQ === realIdx ? (
                                <span className="text-2xl text-rose-500">-</span>
                              ) : (
                                <span className="text-2xl text-rose-500">+</span>
                              )}
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {expandedFAQ === realIdx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <div className="px-6 pb-6 text-gray-700" dir="auto">
                                  {faq.answer(t)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              </>
            }
          />
          <Route path="/recruiter" element={<RecruiterAccess />} />
          <Route path="/student" element={<StudentAccess />} />

          <Route path="/helloS" element={<HelloS />} />
         <Route path="/interview" element={<InterviewSystem />} />
          
          {/* HR Profile Matching Route */}
          <Route
            path="/matching"
            element={<HRMatchingPage />}
          />




          {/* Include a catch-all redirect for incorrect URLs */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center flex-col p-4">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p className="mb-4">The page you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/")}>Go to Homepage</Button>
            </div>
          } />
        </Routes>
        {/* Footer */}
        <Footer />
        <AnimatePresence>
          {showForm && (
            <ChatForm isVisible={showForm} onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>
      </main>
    </>
  )
}