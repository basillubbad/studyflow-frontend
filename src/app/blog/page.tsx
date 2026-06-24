import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function BlogPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground text-lg mb-8">
            Read our latest articles, study tips, and updates from the StudyFlow team.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
