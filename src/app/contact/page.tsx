"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Send, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      toast.success("Message Sent Successfully!", {
        description: "Thank you for reaching out. Our team will get back to you shortly."
      });
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
      setErrors({});
    } else {
      toast.error("Please correctly fill in all required fields.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear the error message once the user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[id];
        return newErrs;
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
             <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Get in Touch</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Have questions, feedback, or need support? Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-card border border-border shadow-lg transition-all duration-300 hover:shadow-xl rounded-3xl p-8 md:p-12 relative overflow-hidden">
          
          {/* Decorative subtle background blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-3 text-foreground">Send a Message</h3>
              <p className="text-muted-foreground text-lg">We typically reply within 24-48 hours.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-semibold text-foreground">First name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all font-medium shadow-sm 
                      ${errors.firstName ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/50"}`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.firstName}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-foreground">Last name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all font-medium shadow-sm 
                      ${errors.lastName ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/50"}`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all font-medium shadow-sm 
                    ${errors.email ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/50"}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-foreground">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all font-medium shadow-sm 
                    ${errors.subject ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/50"}`}
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-foreground">Message</label>
                <textarea 
                  id="message" 
                  rows={6} 
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all resize-none font-medium text-foreground shadow-sm 
                    ${errors.message ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/50"}`}
                  placeholder="Write your message here..."
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full py-4 px-6 mt-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 text-lg"
              >
                <Send className="w-6 h-6" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
