

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppData, GalleryImage } from './types';
import { initialData } from './initialData';
import { loadAppData, saveDataToLocalStorage, saveGalleryToDB } from './services';
import AdminPanel from './components/admin/AdminPanel';

// --- MAIN APP COMPONENT ---

export default function App() {
  const [data, setData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    specials: useRef<HTMLElement>(null),
    menu: useRef<HTMLElement>(null),
    events: useRef<HTMLElement>(null),
    gallery: useRef<HTMLElement>(null),
    testimonials: useRef<HTMLElement>(null),
    team: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const loadData = async () => {
      const appData = await loadAppData();
      setData(appData);
      setLoading(false);
    };
    loadData();
    
    // Check session storage for login status
    if (sessionStorage.getItem('generalis_admin_auth') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSave = async (newData: AppData) => {
    const { gallery, ...restOfData } = newData;
    saveDataToLocalStorage(restOfData);
    await saveGalleryToDB(gallery);
    setData(newData);
    alert('Changes saved successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-2xl font-heading text-primary">Loading Generali's...</div>
      </div>
    );
  }

  return (
    <div className="bg-background font-sans text-charcoal">
      <Header sectionRefs={sectionRefs} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <Hero data={data.hero} ref={sectionRefs.home} />
        <About data={data.about} ref={sectionRefs.about} />
        <Specials data={data.specials} ref={sectionRefs.specials} />
        <Menu data={data.menu} ref={sectionRefs.menu} />
        <Events data={data.events} ref={sectionRefs.events} />
        <Gallery data={data.gallery} ref={sectionRefs.gallery} />
        <Testimonials data={data.testimonials} ref={sectionRefs.testimonials} />
        <Team data={data.team} ref={sectionRefs.team} />
        <Contact data={data.contact} rules={data.rules} ref={sectionRefs.contact} />
      </main>
      <Footer onAdminClick={() => setShowAdminPanel(true)} />
      <ScrollToTopButton />
      {showAdminPanel && (
        <AdminPanel
          data={data}
          onSave={handleSave}
          onClose={() => setShowAdminPanel(false)}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
    </div>
  );
}


// --- INTERSECTION OBSERVER HOOK ---
const useOnScreen = (refs: React.RefObject<HTMLElement>[], setActiveSection: (id: string) => void) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
        refs.forEach(ref => {
            if(ref.current) observer.unobserve(ref.current);
        });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};


// --- UI ICONS ---

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- SECTION COMPONENTS ---

// FIX: Update component prop types to use React.FC and an explicit interface to resolve typing issues.
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}
const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className={`font-heading font-semibold text-sm uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-primary' : 'text-charcoal hover:text-primary'}`}
  >
    {children}
  </a>
);

interface HeaderProps {
    sectionRefs: { [key: string]: React.RefObject<HTMLElement> };
    activeSection: string;
    setActiveSection: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ sectionRefs, activeSection, setActiveSection }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    useOnScreen(Object.values(sectionRefs), setActiveSection);

    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'home', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'menu', label: 'Menu' },
        { id: 'events', label: 'Events' }, { id: 'gallery', label: 'Gallery' }, { id: 'contact', label: 'Contact' }
    ];

    const handleLinkClick = (id: string) => {
      sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home');}} className="font-heading text-2xl font-bold text-primary">Generali's</a>
                <nav className="hidden lg:flex space-x-8">
                    {navItems.map(item => (
                        <NavLink key={item.id} href={`#${item.id}`} isActive={activeSection === item.id} onClick={() => handleLinkClick(item.id)}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="flex items-center">
                    <a href="#contact" onClick={(e) => { e.preventDefault(); handleLinkClick('contact');}} className="hidden md:inline-block bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-300">Reserve</a>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden ml-4 text-charcoal">
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white/95 backdrop-blur-sm absolute top-full left-0 w-full py-4 shadow-lg">
                    <nav className="flex flex-col items-center space-y-4">
                        {navItems.map(item => (
                            <NavLink key={item.id} href={`#${item.id}`} isActive={activeSection === item.id} onClick={() => handleLinkClick(item.id)}>
                                {item.label}
                            </NavLink>
                        ))}
                        <a href="#contact" onClick={(e) => { e.preventDefault(); handleLinkClick('contact');}} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-300 mt-2">Reserve</a>
                    </nav>
                </div>
            )}
        </header>
    );
};


const Hero = React.forwardRef<HTMLElement, { data: AppData['hero'] }>(({ data }, ref) => (
  <section ref={ref} id="home" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
    <div className="absolute inset-0 bg-black/50 z-10"></div>
    <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full bg-cover bg-center animate-kenburns" style={{ backgroundImage: `url(https://picsum.photos/1920/1080?random=15)` }}></div>
    </div>
    <div className="relative z-20 text-center px-4">
      <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase" dangerouslySetInnerHTML={{ __html: data.title }}></h1>
      <p className="mt-4 text-lg md:text-2xl font-light">{data.subtitle}</p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#contact" className="bg-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-colors duration-300 w-full sm:w-auto">Reserve a Table</a>
        <a href="#menu" className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white/30 transition-colors duration-300 w-full sm:w-auto">Place an Order</a>
        <a href="#menu" className="border-2 border-primary text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-primary hover:text-white transition-all duration-300 w-full sm:w-auto">View Menu</a>
      </div>
    </div>
  </section>
));

// FIX: Update component prop types to use React.FC and an explicit interface to resolve typing issues.
interface SectionTitleProps {
  children: React.ReactNode;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
    <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-12 text-charcoal">{children}</h2>
);

const About = React.forwardRef<HTMLElement, { data: AppData['about'] }>(({ data }, ref) => (
  <section ref={ref} id="about" className="py-20 md:py-32">
    <div className="container mx-auto px-6 text-center">
      <SectionTitle>Our Vibe</SectionTitle>
      <p className="max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">{data}</p>
    </div>
  </section>
));

const Specials = React.forwardRef<HTMLElement, { data: AppData['specials'] }>(({ data }, ref) => (
    <section ref={ref} id="specials" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
            <SectionTitle>Today's Specials</SectionTitle>
            <div
                className="prose max-w-2xl mx-auto p-8 border-2 border-dashed border-primary/50 rounded-lg bg-background"
                dangerouslySetInnerHTML={{ __html: data }}
            />
        </div>
    </section>
));

const Menu = React.forwardRef<HTMLElement, { data: AppData['menu'] }>(({ data }, ref) => (
  <section ref={ref} id="menu" className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <SectionTitle>Our Menu</SectionTitle>
      {/* Menu Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {data.overview.map(category => (
          <div key={category.title} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-heading text-2xl font-bold mb-4">{category.title}</h3>
            <ul className="space-y-2">
              {category.items.map(item => (
                <li key={item.name} className="flex justify-between items-baseline">
                  <span>{item.name}</span>
                  <span className="font-semibold">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Full Menu */}
      <div>
        {data.fullMenu.map(category => (
          <div key={category.title} className="mb-12">
            <h3 className="font-heading text-3xl font-bold text-center mb-8">{category.title}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {category.items.map(item => (
                <div key={item.name} className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                    {item.image && <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md mr-4"/>}
                    <div className="flex-grow">
                        <h4 className="font-bold text-lg">{item.name}</h4>
                    </div>
                    <p className="text-lg font-semibold text-primary">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Events = React.forwardRef<HTMLElement, { data: AppData['events'] }>(({ data }, ref) => (
  <section ref={ref} id="events" className="py-20 md:py-32 bg-charcoal text-white">
    <div className="container mx-auto px-6">
      <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-12 text-white">Upcoming Events</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((event, index) => (
          <div key={index} className="bg-white/5 rounded-lg overflow-hidden group">
            <img src={event.image} alt={event.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="p-6">
              <p className="text-primary font-semibold mb-2">{event.date}</p>
              <h3 className="font-heading text-2xl font-bold mb-3">{event.title}</h3>
              <p className="text-white/80">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Gallery = React.forwardRef<HTMLElement, { data: AppData['gallery'] }>(({ data }, ref) => {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <section ref={ref} id="gallery" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <SectionTitle>Our Gallery</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((img, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg cursor-pointer group" onClick={() => setLightboxImage(img)}>
                <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-end p-4">
                  <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </>
  );
});

const Lightbox = ({ image, onClose }: { image: GalleryImage, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={image.src} alt={image.caption} className="max-w-full max-h-[80vh] object-contain rounded-lg"/>
            <p className="text-center text-white mt-4">{image.caption}</p>
            <button onClick={onClose} className="absolute -top-4 -right-4 bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center text-2xl">&times;</button>
        </div>
    </div>
);

const Testimonials = React.forwardRef<HTMLElement, { data: AppData['testimonials'] }>(({ data }, ref) => (
  <section ref={ref} id="testimonials" className="py-20 md:py-32 bg-white">
    <div className="container mx-auto px-6">
      <SectionTitle>From Our Guests</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((testimonial, index) => (
          <div key={index} className="bg-background p-8 rounded-lg">
            <p className="italic mb-4">"{testimonial.quote}"</p>
            <p className="font-bold">{testimonial.author}</p>
            <p className="text-sm text-charcoal/70">{testimonial.location}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Team = React.forwardRef<HTMLElement, { data: AppData['team'] }>(({ data }, ref) => (
  <section ref={ref} id="team" className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <SectionTitle>Meet The Team</SectionTitle>
      <div className="flex flex-col md:flex-row justify-center items-center gap-12">
        {data.map((member, index) => (
          <div key={index} className="text-center max-w-sm">
            <img src={member.image} alt={member.name} className="w-40 h-40 object-cover rounded-full mx-auto mb-4 border-4 border-primary" />
            <h3 className="font-heading text-2xl font-bold">{member.name}</h3>
            <p className="text-primary font-semibold mb-2">{member.role}</p>
            <p>{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Contact = React.forwardRef<HTMLElement, { data: AppData['contact']; rules: AppData['rules'] }>(({ data, rules }, ref) => (
  <section ref={ref} id="contact" className="py-20 md:py-32 bg-white">
    <div className="container mx-auto px-6">
      <SectionTitle>Visit Us</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h3 className="font-heading text-3xl font-bold mb-4">Get In Touch</h3>
          <p className="mb-2"><strong>Address:</strong> {data.address}</p>
          <p className="mb-6"><strong>Phone:</strong> <a href={`tel:${data.phone}`} className="text-primary hover:underline">{data.phone}</a></p>

          <h3 className="font-heading text-2xl font-bold mb-4">Opening Hours</h3>
          <p className="mb-2"><strong>Mon - Thurs:</strong> 12pm - 11pm</p>
          <p className="mb-2"><strong>Fri - Sat:</strong> 12pm - 1am</p>
          <p className="mb-6"><strong>Sun:</strong> 12pm - 10pm</p>

          <h3 className="font-heading text-2xl font-bold mb-4">House Rules</h3>
          <ul className="list-disc list-inside space-y-1">
            {rules.map((rule, index) => <li key={index}>{rule}</li>)}
          </ul>
        </div>
        <div className="h-96 lg:h-full rounded-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.208183187216!2d39.8552606147598!3d-3.642958997380088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183f2187b5555555%3A0x8f78536553835016!2sKilifi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1628863659247!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            title="Restaurant Location"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
));

const Footer = ({ onAdminClick }: { onAdminClick: () => void }) => (
    <footer className="bg-charcoal text-white/80 pt-16">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h4 className="font-heading text-xl font-bold text-white mb-4">About Generali's</h4>
                    <p className="text-sm">The heart of Kilifi's social scene. Good food, great vibes, and unforgettable nights. Join us for an authentic coastal experience.</p>
                </div>
                <div>
                    <h4 className="font-heading text-xl font-bold text-white mb-4">Newsletter</h4>
                    <p className="text-sm mb-4">Sign up for special offers and event news.</p>
                    <form className="flex">
                        <input type="email" placeholder="Your Email" className="bg-white/10 text-white placeholder-white/50 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary flex-grow" />
                        <button type="submit" className="bg-primary text-white font-bold px-4 py-2 rounded-r-md hover:bg-opacity-80 transition-colors">Sign Up</button>
                    </form>
                </div>
                <div>
                    <h4 className="font-heading text-xl font-bold text-white mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 py-4 text-center text-sm flex justify-between items-center">
                <span>&copy; {new Date().getFullYear()} Generali's Bar & Kitchen. All Rights Reserved.</span>
                <button onClick={onAdminClick} className="text-xs text-white/30 hover:text-white/60 transition-colors">Admin Panel</button>
            </div>
        </div>
    </footer>
);

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 300) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
    );
};
