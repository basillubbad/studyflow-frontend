import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Pricing</h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground text-lg mb-8">
            Our pricing plans are designed to fit your academic needs.
            More details coming soon!
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
