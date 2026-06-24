import {
  BookOpen,
  ListChecks,
  BarChart3,
  Focus,
  Route,
  Bell,
  Flame,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Smart Course Management",
    description:
      "Organize courses by semester, track weekly progress, and manage study materials all in one place.",
  },
  {
    icon: ListChecks,
    title: "Automatic Task Generation",
    description:
      "Tasks are auto-generated from your course schedule. Never miss an assignment or deadline again.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visualize your academic progress with intuitive charts showing GPA, credits, and completion rates.",
  },
  {
    icon: Route,
    title: "Self-Learning Paths",
    description:
      "Create and track personal learning goals beyond your coursework with structured learning paths.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed specifically for students to organize,
            track, and achieve academic excellence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
