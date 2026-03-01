import Hero from "@/components/Hero";
import OriginSection from "@/components/OriginSection";
import ArticlePreview from "@/components/ArticlePreview";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <OriginSection />
      <ArticlePreview />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
