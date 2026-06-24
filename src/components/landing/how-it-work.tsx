import { UserPlus, BookOpen, Target, GraduationCap } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Academic Profile",
    description:
      "Set up your academic year, major, credit hours, and graduation timeline in minutes.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Add Courses & Semester Plan",
    description:
      "Organize your semester with courses, weekly topics, and study materials all in one place.",
  },
  {
    icon: Target,
    step: "03",
    title: "Track Tasks & Focus Sessions",
    description:
      "Stay on top of assignments, exams, and deep work with smart task management and Pomodoro focus.",
  },
  {
    icon: GraduationCap,
    step: "04",
    title: "Learn, Progress & Graduate",
    description:
      "Monitor your progress, build learning streaks, and graduate with confidence and clarity.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl text-balance">
            Four Simple Steps to Academic Success
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Get started in minutes and transform how you approach your
            university life.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-px w-full bg-border lg:block" />
              )}

              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
                <item.icon className="h-8 w-8" />
              </div>

              <span className="mt-4 text-xs font-bold uppercase tracking-widest text-secondary">
                Step {item.step}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
