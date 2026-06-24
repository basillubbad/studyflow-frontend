import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science, 3rd Year",
    avatar: "SJ",
    rating: 5,
    content:
      "StudyFlow completely changed how I manage my coursework. My GPA went from 3.2 to 3.8 in just one semester.",
  },
  {
    name: "Michael Chen",
    role: "Engineering, 2nd Year",
    avatar: "MC",
    rating: 5,
    content:
      "I used to miss deadlines all the time. Now I'm always ahead of my assignments.",
  },
  {
    name: "Emily Rodriguez",
    role: "Business Administration, 4th Year",
    avatar: "ER",
    rating: 5,
    content:
      "The self-learning path feature helped me learn Python alongside my business courses.",
  },
  {
    name: "David Park",
    role: "Medical Sciences, 2nd Year",
    avatar: "DP",
    rating: 5,
    content: "Focus mode and streak system keep me motivated every day.",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Students Everywhere
          </h2>
          <p className="text-lg text-muted-foreground">
            See what students are saying about their experience with StudyFlow.
          </p>
        </div>

        {/* Auto Scroll Row */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((item, index) => (
              <div
                key={index}
                className="min-w-2xl md:min-w-[250px] bg-background border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-foreground mb-6 leading-relaxed">
                  &quot;{item.content}&quot;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
