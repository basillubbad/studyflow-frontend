"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is StudyFlow?",
    answer: "StudyFlow is a comprehensive academic organization platform designed specifically for students. It helps you track courses, assignments, calendars, and your overall academic progress in one unified dashboard."
  },
  {
    question: "Is StudyFlow free to use?",
    answer: "We offer a generous free tier that includes all basic features like course tracking and calendar integration. For advanced features like AI study plans, we have premium subscription options."
  },
  {
    question: "Can I sync my university schedule with StudyFlow?",
    answer: "Yes! StudyFlow supports calendar sync through standard iCal formats, allowing you to import your university schedule directly into your planner."
  },
  {
    question: "How do I add a new semester or course?",
    answer: "You can add new semesters and underlying courses from the 'Academic Planning' section in your dashboard. Courses automatically inherit the academic timeline from their parent semester."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption to protect your data. Your personal information and academic records are never shared with third parties without your explicit consent."
  },
  {
    question: "Does StudyFlow have a mobile app?",
    answer: "Currently, StudyFlow is a fully responsive web application that works seamlessly on any mobile browser. Native iOS and Android apps are currently in development!"
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Everything you need to know about the product and how it works. Can&apos;t find the answer you&apos;re looking for? Feel free to <a href="/contact" className="text-primary hover:underline transition-colors font-medium">contact our team</a>.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-xl bg-card transition-all duration-300 overflow-hidden ${
                  isOpen ? "border-primary/30 shadow-sm" : "border-border hover:border-primary/20"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-lg text-foreground pr-8">{faq.question}</span>
                  <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${isOpen ? "bg-primary/10 text-primary" : "bg-primary/5 text-muted-foreground"}`}>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`} 
                    />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
