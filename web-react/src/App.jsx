import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { useProducts } from './hooks/useProducts';
import { useReviews } from './hooks/useReviews';

import AgeGateModal from './components/AgeGateModal';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import AdBanner from './components/AdBanner';
import GalleryRow from './components/GalleryRow';
import Tasting from './components/Tasting';
import MarqueeStrip from './components/MarqueeStrip';
import PromoBanner from './components/PromoBanner';
import BulkPromoBanner from './components/BulkPromoBanner';
import Shop from './components/Shop';
import WhyChooseUs from './components/WhyChooseUs';
import About from './components/About';
import TequilaHighlight from './components/TequilaHighlight';
import Ambassador from './components/Ambassador';
import Varietals from './components/Varietals';
import Vintage from './components/Vintage';
import FullBleedBanner from './components/FullBleedBanner';
import Testimonials from './components/Testimonials';
import StoreInfo from './components/StoreInfo';
import EnquirySection from './components/EnquirySection';
import ContactSection from './components/ContactSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartToast from './components/CartToast';
import CartDrawer from './components/CartDrawer';
import Chatbot from './components/Chatbot';
import WhatsAppFloat from './components/WhatsAppFloat';
import ScrollEffects from './components/ScrollEffects';

/* Section order mirrors index.html exactly:
   age modal -> navbar -> mobile menu -> hero -> ad banner -> gallery ->
   tasting -> marquee -> promo banner -> shop (slider+cards+PDP+cart) ->
   why-choose-us -> about -> ambassador -> varietals -> vintage ->
   full-bleed text -> testimonials(+review form) -> store-info ->
   enquiry -> contact -> newsletter -> footer -> cart drawer -> chatbot -> wa float */
function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const { reviews, loading: reviewsLoading } = useReviews();

  return (
    <>
      <AgeGateModal />

      <Navbar onOpenMobileMenu={() => setMobileMenuOpen((v) => !v)} mobileMenuOpen={mobileMenuOpen} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main>
        <Hero />
        <TequilaHighlight />
        <AdBanner />
        <GalleryRow />
        <Tasting />
        <MarqueeStrip />
        <PromoBanner />
        <BulkPromoBanner />
        <Shop products={products} loading={productsLoading} />
        <WhyChooseUs />
        <About />
        <Ambassador />
        <Varietals />
        <Vintage />
        <FullBleedBanner />
        <Testimonials reviews={reviews} loading={reviewsLoading} />
        <StoreInfo />
        <EnquirySection />
        <ContactSection />
        <Newsletter />
        <Footer />
        <CartToast />
      </main>

      <CartDrawer />
      <Chatbot />
      <WhatsAppFloat />

      <ScrollEffects />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
