import { useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero3D from '../landing/Hero3D';
import Stats from '../landing/Stats';
import Languages3D from '../landing/Languages3D';
import HowItWorks3D from '../landing/HowItWorks3D';
import Sample3D from '../landing/Sample3D';
import FinalCTA from '../landing/FinalCTA';
import Footer3D from '../landing/Footer3D';
import Scene3DBackdrop from '../landing/Scene3DBackdrop';
import { LandingScrollContext } from '../landing/scrollContext';

export default function Landing() {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <div className="page landing3d-page">
      <Navbar />
      <LandingScrollContext.Provider value={scrollRef}>
        <main ref={scrollRef} className="page-scroll landing3d-scroll">
          <Scene3DBackdrop />
          <div className="landing3d-content">
            <Hero3D />
            <Stats />
            <Languages3D />
            <HowItWorks3D />
            <Sample3D />
            <FinalCTA />
            <Footer3D />
          </div>
        </main>
      </LandingScrollContext.Provider>
    </div>
  );
}
