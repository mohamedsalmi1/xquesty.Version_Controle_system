import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Send, Sparkles, Briefcase, Mail, Building } from "lucide-react"
//import { supabase } from "@/lib/supabaseClient"
import { recruiterSupabase as supabase } from '@/lib/supabaseClient';



const questions = [
  {
    question: "What's your full name?",
    field: "name",
    type: "text",
    icon: <Heart className="w-5 h-5 text-[hsl(var(--coral))]" />,
    placeholder: "Enter your full name",
    achievement: "Nice to meet you! 👋"
  },
  {
    question: "How can we reach you?",
    field: "email",
    type: "email",
    icon: <Mail className="w-5 h-5 text-[hsl(var(--purple))]" />,
    placeholder: "Enter your email",
    achievement: "Perfect! We'll keep in touch 📧"
  },
  {
    question: "What field are you passionate about?",
    field: "field",
    type: "text",
    icon: <Briefcase className="w-5 h-5 text-[hsl(var(--mint))]" />,
    placeholder: "e.g., Marketing, Technology, Design",
    achievement: "That's an exciting field! 🌟"
  },
  {
    question: "Do you have any dream companies?",
    field: "dream_companies", // Changed from 'companies' to match database column
    type: "text",
    icon: <Building className="w-5 h-5 text-[hsl(var(--sky))]" />,
    placeholder: "e.g., Google, Apple, Startup",
    achievement: "Dream big! We'll help you get there 🚀"
  }
]

export function ChatForm({ isVisible, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState("")
  const [showAchievement, setShowAchievement] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    if (inputValue.trim()) {
      setShowAchievement(true)
    } else {
      setShowAchievement(false)
    }
  }, [inputValue])

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    const finalAnswers = {
      ...answers,
      [questions[currentStep].field]: inputValue
    }

    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([finalAnswers])

      if (error) throw error

      setShowThankYou(true)
      setTimeout(() => {
        onClose()
        setCurrentStep(0)
        setAnswers({})
        setInputValue("")
        setShowThankYou(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting survey:', error)
    }
  }

  const handleNext = () => {
    if (!inputValue.trim()) return

    const currentQuestion = questions[currentStep]
    setAnswers(prev => ({ ...prev, [currentQuestion.field]: inputValue }))
    setInputValue("")
    setShowAchievement(false)
    setCurrentStep(prev => prev + 1)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (currentStep === questions.length - 1) {
        handleSubmit()
      } else {
        handleNext()
      }
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50 p-4"
      onClick={() => {
        setShowThankYou(false)
        setCurrentStep(0)
        setAnswers({})
        setInputValue("")
        onClose()
      }}
    >
      <Card
        className="w-full max-w-md mx-auto bg-white/95"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {!showThankYou ? questions[currentStep].icon : <Sparkles className="w-5 h-5 text-[hsl(var(--purple))]" />}
            Let's Get Started!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!showThankYou ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg mb-2">{questions[currentStep].question}</p>
                  <div className="flex gap-2">
                    <Input
                      type={questions[currentStep].type}
                      placeholder={questions[currentStep].placeholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-2"
                    />
                    <Button 
                      onClick={currentStep === questions.length - 1 ? handleSubmit : handleNext}
                      className="button-gradient"
                      disabled={!inputValue.trim()}
                    >
                      {currentStep === questions.length - 1 ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showAchievement && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-[hsl(var(--mint))] mt-2 font-medium"
                      >
                        {questions[currentStep].achievement}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <Sparkles className="w-12 h-12 text-[hsl(var(--purple))] mx-auto mb-4" />
                  <p className="text-2xl font-semibold mb-2">Thanks, {answers.name}! ✨</p>
                  <p className="text-lg text-muted-foreground">
                    We'll contact you soon to help you find the perfect internship opportunity.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!showThankYou && (
              <div className="flex justify-center mt-4">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full mx-1 transition-colors duration-300 ${
                      idx === currentStep ? "bg-[hsl(var(--mint))]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
export default ChatForm
