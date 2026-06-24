import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground text-lg mb-8">
            We use cookies to improve your experience. Learn more about how we use
            cookies and similar technologies.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
