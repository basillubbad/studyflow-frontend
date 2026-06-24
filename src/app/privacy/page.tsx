import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ShieldCheck, CalendarClock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Your privacy is important to us. We are committed to protecting your personal data and being transparent about how we use it.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-background border border-border inline-flex px-4 py-2 rounded-full shadow-sm">
            <CalendarClock className="w-4 h-4" />
            Last updated: March 20, 2026
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar Table of Contents */}
      <section className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="md:w-1/4 hidden md:block">
            <div className="sticky top-32 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Table of Contents</h3>
              <nav className="flex flex-col space-y-3 text-sm font-medium">
                <a href="#information-we-collect" className="text-foreground hover:text-primary transition-colors">1. Information We Collect</a>
                <a href="#how-we-use-information" className="text-muted-foreground hover:text-primary transition-colors">2. How We Use Information</a>
                <a href="#data-sharing" className="text-muted-foreground hover:text-primary transition-colors">3. Data Sharing & Disclosure</a>
                <a href="#data-security" className="text-muted-foreground hover:text-primary transition-colors">4. Data Security</a>
                <a href="#your-rights" className="text-muted-foreground hover:text-primary transition-colors">5. Your Privacy Rights</a>
                <a href="#contact-us" className="text-muted-foreground hover:text-primary transition-colors">6. Contact Us</a>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="md:w-3/4 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-li:text-muted-foreground">
            
            <p className="text-lg leading-relaxed mb-10 text-foreground font-medium">
              At StudyFlow, we respect your privacy. This Privacy Policy outlines the types of personal information we collect and receive when you use our platform, as well as how we safeguard your information.
            </p>

            <div id="information-we-collect" className="scroll-mt-32 mb-12">
              <h2 className="text-2xl mb-4">1. Information We Collect</h2>
              <p>When you use StudyFlow, we may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Account Information:</strong> Name, email address, password, and university details when you register for an account.</li>
                <li><strong>Academic Data:</strong> Courses, schedules, assignments, grades, and calendar events that you voluntarily input into the system.</li>
                <li><strong>Usage Data:</strong> Information on how you interact with our application, which helps us improve the user experience.</li>
              </ul>
            </div>

            <div id="how-we-use-information" className="scroll-mt-32 mb-12">
              <h2 className="text-2xl mb-4">2. How We Use Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>To provide, maintain, and improve our platform.</li>
                <li>To personalize your academic experience and study recommendations.</li>
                <li>To send you technical notices, updates, security alerts, and support messages.</li>
                <li>To protect against malicious or fraudulent activity.</li>
              </ul>
            </div>

            <div id="data-sharing" className="scroll-mt-32 mb-12">
              <h2 className="text-2xl mb-4">3. Data Sharing & Disclosure</h2>
              <p>Your academic data is your own. We do not sell your personal data to third parties. We may share information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>With service providers who perform services on our behalf (e.g., secure cloud hosting).</li>
                <li>If explicitly requested or authorized by you.</li>
                <li>To comply with a legal obligation or protect our rights.</li>
              </ul>
            </div>

            <div id="data-security" className="scroll-mt-32 mb-12">
              <h2 className="text-2xl mb-4">4. Data Security</h2>
              <p>
                We implement robust security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your data.
              </p>
            </div>

            <div id="your-rights" className="scroll-mt-32 mb-12">
              <h2 className="text-2xl mb-4">5. Your Privacy Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access the personal information we hold about you.</li>
                <li>Request the correction of inaccurate information.</li>
                <li>Request the deletion of your account and associated data.</li>
                <li>Export your academic data in a standard format.</li>
              </ul>
            </div>

            <div id="contact-us" className="scroll-mt-32">
              <h2 className="text-2xl mb-4">6. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our practices, please do not hesitate to reach out to our privacy team at <a href="mailto:privacy@studyflow.edu">privacy@studyflow.edu</a> or visit our <a href="/contact">Contact Us</a> page.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
