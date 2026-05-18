import { Contact } from "@/components/Contact";
import { Definition } from "@/components/Definition";
import { Footer } from "@/components/Footer";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/Header";
import { ScrollTour } from "@/components/ScrollTour";
import { Marquee } from "@/components/Marquee";
import { Practice } from "@/components/Practice";
import { Process } from "@/components/Process";
import { Studio } from "@/components/Studio";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <Grain />
      <Header />
      <main>
        <ScrollTour />
        <Definition />
        <Marquee />
        <Practice />
        <Work />
        <Process />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
