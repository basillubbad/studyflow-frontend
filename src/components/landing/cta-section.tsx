import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-10 lg:py-18 ">
      <div className="container mx-auto p-6 bg-primary rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Start Your Journey Today
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-6 text-balance">
            Ready to Transform Your Academic Life?
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already improved their grades,
            reduced stress, and achieved their academic goals with StudyFlow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/register">
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
