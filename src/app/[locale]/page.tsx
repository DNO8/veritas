"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase/client";
import gsap from "gsap";

interface Project {
  id: string;
  title: string;
  short_description: string;
  cover_image_url: string;
  current_amount: number;
  goal_amount: number;
  category: string | null;
  status: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  all: "🌐",
  social: "🤝",
  tech: "💻",
  education: "📚",
  environment: "🌱",
  art: "🎨",
  health: "🏥",
};

const MILESTONES = [
  {
    title: "PRIMEROS PASOS",
    progress: 100,
    amount: "$50K",
    color: "bg-[#FDCB6E]",
  },
  {
    title: "CRECIMIENTO SOSTENIDO",
    progress: 75,
    amount: "$150K",
    color: "bg-[#E67E22]",
  },
  {
    title: "EXPANSIÓN REGIONAL",
    progress: 40,
    amount: "$500K",
    color: "bg-[#FDCB6E]",
  },
  {
    title: "ESCALA CONTINENTAL",
    progress: 10,
    amount: "$2M",
    color: "bg-[#E67E22]",
  },
];

export default function Home() {
  const t = useTranslations("home");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const CATEGORIES = [
    { id: "all", label: t("categoryAll"), icon: CATEGORY_ICONS.all },
    { id: "social", label: t("categorySocial"), icon: CATEGORY_ICONS.social },
    { id: "tech", label: t("categoryTech"), icon: CATEGORY_ICONS.tech },
    {
      id: "education",
      label: t("categoryEducation"),
      icon: CATEGORY_ICONS.education,
    },
    {
      id: "environment",
      label: t("categoryEnvironment"),
      icon: CATEGORY_ICONS.environment,
    },
    { id: "art", label: t("categoryArt"), icon: CATEGORY_ICONS.art },
    { id: "health", label: t("categoryHealth"), icon: CATEGORY_ICONS.health },
  ];
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await supabase
          .from("projects")
          .select(
            "id, title, short_description, cover_image_url, current_amount, goal_amount, category, status",
          )
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(6);

        if (data) {
          setProjects(data as Project[]);
          setFilteredProjects(data as Project[]);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects by category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((p) => p.category === selectedCategory),
      );
    }
  }, [selectedCategory, projects]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#FDCB6E] border-b-4 border-black overflow-hidden">
        {/* Honeycomb Pattern Overlay */}
        <div className="absolute inset-0 hex-pattern-white opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <span className="px-4 py-2 bg-black text-white font-mono text-sm border-2 border-black">
              {t("badge")}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
              <span className="block">{t("titleLine1")}</span>
              <span className="block text-[#E67E22]">{t("titleLine2")}</span>
              <span className="block">{t("titleLine3")}</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-lg md:text-xl text-black/70 max-w-2xl mx-auto mb-10"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Link
              href="/projects"
              className="btn-brutal btn-brutal-dark text-lg"
            >
              {t("exploreProjectsBtn")}
            </Link>
            <Link
              href="/projects/new"
              className="btn-brutal btn-brutal-outline text-lg bg-white"
            >
              {t("createProjectBtn")}
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            <StatCard value="$2.4M" label={t("statFundsRaised")} icon="💰" />
            <StatCard value="847" label={t("statProjectsFunded")} icon="📊" />
            <StatCard value="15K+" label={t("statActiveDonors")} icon="🐝" />
          </motion.div>
        </div>

        {/* Interactive Bee that follows cursor */}
        <FollowingBee />
      </section>

      {/* Projects Section - "IMPULSA EL CAMBIO" */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              {t("driveChange")}{" "}
              <span className="text-[#E67E22]">{t("change")}</span>
            </h2>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 border-2 border-black font-bold text-sm transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#FDCB6E] shadow-[4px_4px_0px_#000]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8 max-w-2xl">
            {t("projectsSubtitle")}
          </p>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link href="/projects" className="btn-brutal btn-brutal-outline">
              {t("viewAllProjects")}
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section - "CERO FRICCIÓN" */}
      <section className="py-16 bg-gray-50 border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("zeroFriction")}{" "}
              <span className="text-[#E67E22]">{t("friction")}</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("frictionSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProcessStep
              number="01"
              icon="🔍"
              title={t("step1Title")}
              description={t("step1Desc")}
              delay={0}
            />
            <ProcessStep
              number="02"
              icon="🎯"
              title={t("step2Title")}
              description={t("step2Desc")}
              delay={0.1}
            />
            <ProcessStep
              number="03"
              icon="💸"
              title={t("step3Title")}
              description={t("step3Desc")}
              delay={0.2}
            />
            <ProcessStep
              number="04"
              icon="📈"
              title={t("step4Title")}
              description={t("step4Desc")}
              delay={0.3}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/signup" className="btn-brutal btn-brutal-primary">
              {t("createAccountBtn")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Milestones Section - "HITOS DE IMPACTO" */}
      <section className="py-16 bg-[#FDCB6E] border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="px-4 py-2 bg-black text-white font-mono text-sm inline-block mb-4">
              {t("roadmapBadge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">
              {t("impactMilestones")}{" "}
              <span className="text-[#E67E22]">{t("impact")}</span>
            </h2>
            <p className="text-black/70 mt-4 max-w-xl mx-auto">
              {t("milestonesSubtitle")}
            </p>
          </motion.div>

          <div className="space-y-4">
            {MILESTONES.map((milestone, index) => (
              <MilestoneBar key={index} milestone={milestone} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Logo size="md" showText={true} animated={false} />
              </div>
              <p className="text-gray-400 text-sm">{t("footerDesc")}</p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-[#FDCB6E]">{t("platform")}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/projects" className="hover:text-white">
                    {t("exploreProjects")}
                  </Link>
                </li>
                <li>
                  <Link href="/projects/new" className="hover:text-white">
                    {t("createProject")}
                  </Link>
                </li>
                <li>
                  <Link href="/my-projects" className="hover:text-white">
                    {t("myProjects")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#FDCB6E]">
                {t("resources")}
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    {t("documentation")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    {t("support")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#FDCB6E]">{t("legal")}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    {t("termsOfUse")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    {t("privacy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    {t("cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">{t("footerCopyright")}</p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-[#FDCB6E] text-black text-xs font-bold border-2 border-[#FDCB6E]">
                TESTNET
              </span>
              <span className="px-3 py-1 bg-transparent text-gray-400 text-xs font-mono border border-gray-700">
                v0.1.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-3xl font-bold text-[#E67E22]">{value}</p>
          <p className="text-xs font-mono text-gray-500 uppercase">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const raised = Number(project.current_amount) || 0;
  const goal = Number(project.goal_amount) || 1;
  const progress = Math.round((raised / goal) * 100);
  const categoryIcon = project.category
    ? CATEGORY_ICONS[project.category]
    : null;

  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -6 }}
        className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden group cursor-pointer"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {categoryIcon && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-[#FDCB6E] text-black text-xs font-bold border-2 border-black">
                {categoryIcon} {project.category}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.short_description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="h-3 bg-gray-200 border-2 border-black">
              <div
                className="h-full bg-[#FDCB6E]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-[#E67E22]">
                ${raised.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                de ${goal.toLocaleString()}
              </p>
            </div>
            <span className="font-mono text-sm font-bold">{progress}%</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ProcessStep({
  number,
  icon,
  title,
  description,
  delay,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] relative"
    >
      <span className="absolute -top-3 -left-3 w-10 h-10 bg-[#FDCB6E] border-3 border-black flex items-center justify-center font-bold text-sm">
        {number}
      </span>
      <div className="text-4xl mb-4 mt-2">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
}

function MilestoneBar({
  milestone,
  index,
}: {
  milestone: (typeof MILESTONES)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000]"
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold">{milestone.title}</h4>
        <span className="font-mono font-bold text-[#E67E22]">
          {milestone.amount}
        </span>
      </div>
      <div className="h-4 bg-gray-200 border-2 border-black">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${milestone.progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.2 }}
          className={`h-full ${milestone.color}`}
        />
      </div>
      <p className="text-right text-xs font-mono text-gray-500 mt-1">
        {milestone.progress}%
      </p>
    </motion.div>
  );
}

function FollowingBee() {
  const beeRef = useRef<HTMLDivElement>(null);
  const [isInHero, setIsInHero] = useState(false);

  useEffect(() => {
    const bee = beeRef.current;
    if (!bee) return;

    // Initial position
    gsap.set(bee, { x: 0, y: 0, scale: 1 });

    // Idle floating animation
    const floatAnimation = gsap.to(bee, {
      y: -15,
      rotation: 5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const heroSection = document.querySelector("section");
      if (!heroSection) return;

      const rect = heroSection.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      setIsInHero(isInside);

      if (isInside) {
        // Calculate position relative to hero section
        const offsetX = 20; // Distance from cursor
        const offsetY = -20;

        // Determine which side of cursor to position bee
        const beeX = e.clientX - rect.left + offsetX;
        const beeY = e.clientY - rect.top + offsetY;

        // Smooth follow with GSAP
        gsap.to(bee, {
          x: beeX,
          y: beeY,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });

        // Rotate bee based on movement direction
        const rotation = e.movementX > 0 ? 10 : e.movementX < 0 ? -10 : 0;
        gsap.to(bee, {
          rotation: rotation,
          duration: 0.2,
        });
      }
    };

    const handleMouseLeave = () => {
      setIsInHero(false);
      // Return to default position
      gsap.to(bee, {
        x: window.innerWidth - 150,
        y: 50,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      });
    };

    // Set initial position
    gsap.set(bee, { x: window.innerWidth - 150, y: 50 });

    window.addEventListener("mousemove", handleMouseMove);
    document
      .querySelector("section")
      ?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      floatAnimation.kill();
      window.removeEventListener("mousemove", handleMouseMove);
      document
        .querySelector("section")
        ?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={beeRef}
      className="absolute pointer-events-none z-50 text-5xl lg:text-6xl hidden md:block select-none"
      style={{ top: 0, left: 0, willChange: "transform" }}
    >
      <span
        className={`inline-block transition-transform duration-200 ${
          isInHero ? "scale-110" : "scale-100"
        }`}
      >
        🐝
      </span>
      {/* Wing flutter effect */}
      {isInHero && (
        <span className="absolute -top-1 -right-1 text-xs animate-ping opacity-50">
          ✨
        </span>
      )}
    </div>
  );
}
