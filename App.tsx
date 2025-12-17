import React, { useState, useEffect, useRef } from 'react';
import { AppData, GalleryImage } from './types';
import { initialData } from './initialData';
import { loadAppData, saveAppDataToSupabase } from './services';
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
    
    if (sessionStorage.getItem('generalis_admin_auth') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSave = async (newData: AppData) => {
    try {
      await saveAppDataToSupabase(newData);
      setData(newData);
      alert('Changes saved successfully!');
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`Failed to save to Supabase: ${err.message || 'Unknown error'}. Please ensure the database table is set up correctly.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-heading text-primary animate-pulse tracking-widest uppercase">Generali's</div>
      </div>
    );
  }

  return (
    <div className="bg-background font-sans text-charcoal selection:bg-primary/30">
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
    className={`font-sans font-medium text-xs uppercase tracking-widest transition-all duration-300 relative py-2 ${isActive ? 'text-primary scale-110' : 'text-charcoal hover:text-primary opacity-70 hover:opacity-100'}`}
  >
    {children}
    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-fade-in-up"></span>}
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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 shadow-xl backdrop-blur-md py-3' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home');}} className="font-heading text-3xl font-bold text-primary tracking-tighter">Generali's</a>
                <nav className="hidden lg:flex space-x-10">
                    {navItems.map(item => (
                        <NavLink key={item.id} href={`#${item.id}`} isActive={activeSection === item.id} onClick={() => handleLinkClick(item.id)}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="flex items-center">
                    <a href="#contact" onClick={(e) => { e.preventDefault(); handleLinkClick('contact');}} className="hidden md:inline-block bg-primary text-white font-bold py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">Reserve</a>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden ml-4 text-charcoal p-2">
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white/98 backdrop-blur-xl absolute top-full left-0 w-full py-8 shadow-2xl animate-fade-in-up">
                    <nav className="flex flex-col items-center space-y-6">
                        {navItems.map(item => (
                            <NavLink key={item.id} href={`#${item.id}`} isActive={activeSection === item.id} onClick={() => handleLinkClick(item.id)}>
                                {item.label}
                            </NavLink>
                        ))}
                        <a href="#contact" onClick={(e) => { e.preventDefault(); handleLinkClick('contact');}} className="bg-primary text-white font-bold py-3 px-10 rounded-full hover:bg-opacity-80 transition-colors duration-300 mt-4">Reserve Now</a>
                    </nav>
                </div>
            )}
        </header>
    );
};


const Hero = React.forwardRef<HTMLElement, { data: AppData['hero'] }>(({ data }, ref) => (
  <section ref={ref} id="home" className="relative h-[100vh] flex items-center justify-center text-white overflow-hidden">
    <div className="absolute inset-0 bg-black/40 z-10"></div>
    <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full bg-cover bg-center animate-ken-burns scale-110" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1920)` }}></div>
    </div>
    <div className="relative z-20 text-center px-6 max-w-5xl">
      <h1 className="font-heading text-5xl md:text-8xl font-bold leading-tight animate-fade-in-up" dangerouslySetInnerHTML={{ __html: data.title }}></h1>
      <p className="mt-6 text-lg md:text-2xl font-light tracking-wide opacity-90 animate-fade-in-up delay-100">{data.subtitle}</p>
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-200">
        <a href="#contact" className="bg-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-2xl shadow-primary/40 hover:scale-105 transition-all w-full sm:w-auto">Book Your Spot</a>
        <a href="#menu" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-white/20 transition-all w-full sm:w-auto">Browse Menu</a>
      </div>
    </div>
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  </section>
));

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
    <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-6xl font-bold text-charcoal mb-4 relative inline-block">
            {children}
            <span className="absolute -bottom-4 left-1/4 right-1/4 h-1 bg-primary rounded-full"></span>
        </h2>
        {subtitle && <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mt-6">{subtitle}</p>}
    </div>
);

const About = React.forwardRef<HTMLElement, { data: AppData['about'] }>(({ data }, ref) => (
  <section ref={ref} id="about" className="py-24 md:py-40 bg-white">
    <div className="container mx-auto px-6 text-center">
      <SectionTitle subtitle="A Taste of Paradise">Our Vibe</SectionTitle>
      <p className="max-w-4xl mx-auto text-xl md:text-2xl font-light leading-relaxed text-charcoal/80">{data}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {['Fresh Ingredients', 'Handcrafted Drinks', 'Live Beats', 'Scenic Views'].map((feature, i) => (
              <div key={i} className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs text-charcoal/60">{feature}</span>
              </div>
          ))}
      </div>
    </div>
  </section>
));

const Specials = React.forwardRef<HTMLElement, { data: AppData['specials'] }>(({ data }, ref) => (
    <section ref={ref} id="specials" className="py-24 md:py-40 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
            <SectionTitle subtitle="Curated Daily">Today's Specials</SectionTitle>
            <div className="max-w-4xl mx-auto relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div
                    className="relative bg-[#222] text-white p-10 md:p-16 rounded-3xl shadow-2xl chalkboard-border font-heading text-lg md:text-xl leading-loose"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: data }}
                />
            </div>
        </div>
    </section>
));

const Menu = React.forwardRef<HTMLElement, { data: AppData['menu'] }>(({ data }, ref) => {
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <section ref={ref} id="menu" className="py-24 md:py-40 bg-white">
            <div className="container mx-auto px-6">
                <SectionTitle subtitle="Exquisite Dining">Our Menu</SectionTitle>
                
                {/* Menu Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {data.fullMenu.map((cat, i) => (
                        <button 
                            key={cat.title}
                            onClick={() => setSelectedTab(i)}
                            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${selectedTab === i ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-primary hover:bg-primary/20'}`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    {data.fullMenu[selectedTab].items.map((item, idx) => (
                        <div key={idx} className="group flex justify-between items-start border-b border-dashed border-charcoal/10 pb-6 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex gap-4 items-center">
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-110 transition-transform"/>
                                )}
                                <div>
                                    <h4 className="font-heading text-2xl font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                                    <p className="text-charcoal/50 text-xs uppercase tracking-widest mt-1">Chef's Selection</p>
                                </div>
                            </div>
                            <span className="font-bold text-primary text-xl font-heading">{item.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

const Events = React.forwardRef<HTMLElement, { data: AppData['events'] }>(({ data }, ref) => (
  <section ref={ref} id="events" className="py-24 md:py-40 bg-charcoal text-white relative">
    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent opacity-5"></div>
    <div className="container mx-auto px-6">
      <SectionTitle subtitle="Join the Crowd">Upcoming Events</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {data.map((event, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden group hover:bg-white/10 transition-all border border-white/10">
            <div className="h-64 overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">Event</div>
            </div>
            <div className="p-8">
              <p className="text-primary font-bold text-sm tracking-widest mb-3">{event.date}</p>
              <h3 className="font-heading text-3xl font-bold mb-4">{event.title}</h3>
              <p className="text-white/60 leading-relaxed font-light">{event.description}</p>
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
      <section ref={ref} id="gallery" className="py-24 md:py-40 bg-white">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Moments & Memories">Gallery</SectionTitle>
          <div className="columns-2 md:columns-4 gap-6 space-y-6">
            {data.map((img, index) => (
              <div key={index} className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-xl break-inside-avoid" onClick={() => setLightboxImage(img)}>
                <img src={img.src} alt={img.caption} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary transform scale-0 group-hover:scale-100 transition-transform delay-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
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
    <div className="fixed inset-0 bg-charcoal/95 z-[60] flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
        <div className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={image.src} alt={image.caption} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"/>
            <div className="mt-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-center text-white font-heading text-2xl">{image.caption}</p>
            </div>
            <button onClick={onClose} className="absolute -top-6 -right-6 bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform">&times;</button>
        </div>
    </div>
);

const Testimonials = React.forwardRef<HTMLElement, { data: AppData['testimonials'] }>(({ data }, ref) => (
  <section ref={ref} id="testimonials" className="py-24 md:py-40 bg-secondary/30">
    <div className="container mx-auto px-6">
      <SectionTitle subtitle="Guest Reviews">Guest Love</SectionTitle>
      <div className="grid md:grid-cols-3 gap-8">
        {data.map((testimonial, index) => (
          <div key={index} className="bg-white p-10 rounded-[3rem] shadow-xl relative animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
            <div className="text-primary text-6xl font-heading absolute -top-4 left-8">“</div>
            <p className="italic text-charcoal/80 text-lg mb-8 leading-relaxed font-light">"{testimonial.quote}"</p>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">{testimonial.author[0]}</div>
                <div>
                    <p className="font-bold font-heading text-xl">{testimonial.author}</p>
                    <p className="text-xs tracking-widest text-primary font-bold uppercase">{testimonial.location}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Team = React.forwardRef<HTMLElement, { data: AppData['team'] }>(({ data }, ref) => (
  <section ref={ref} id="team" className="py-24 md:py-40 bg-white">
    <div className="container mx-auto px-6">
      <SectionTitle subtitle="The Artisans">Our Experts</SectionTitle>
      <div className="flex flex-col md:flex-row justify-center items-center gap-16">
        {data.map((member, index) => (
          <div key={index} className="text-center max-w-sm group">
            <div className="relative mb-8 inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={member.image} alt={member.name} className="relative w-56 h-56 object-cover rounded-full mx-auto border-[12px] border-secondary group-hover:border-primary transition-colors duration-500 shadow-xl" />
            </div>
            <h3 className="font-heading text-3xl font-bold mb-2">{member.name}</h3>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-4">{member.role}</p>
            <p className="text-charcoal/70 font-light leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Contact = React.forwardRef<HTMLElement, { data: AppData['contact']; rules: AppData['rules'] }>(({ data, rules }, ref) => (
  <section ref={ref} id="contact" className="py-24 md:py-40 bg-background">
    <div className="container mx-auto px-6">
      <SectionTitle subtitle="Find Us">Visit Generali's</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-20 items-stretch">
        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl flex flex-col justify-center">
          <div className="space-y-12">
              <div>
                  <h3 className="font-heading text-4xl font-bold mb-8 text-primary">Location</h3>
                  <p className="text-xl mb-4 font-light">{data.address}</p>
                  <a href={`tel:${data.phone}`} className="text-2xl font-bold hover:text-primary transition-colors">{data.phone}</a>
              </div>

              <div>
                  <h3 className="font-heading text-2xl font-bold mb-6">Hours</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium opacity-70">
                      <span>Mon - Thurs</span><span>12pm - 11pm</span>
                      <span>Fri - Sat</span><span>12pm - 1am</span>
                      <span>Sun</span><span>12pm - 10pm</span>
                  </div>
              </div>

              <div>
                  <h3 className="font-heading text-2xl font-bold mb-6">Guidelines</h3>
                  <ul className="space-y-3">
                    {rules.map((rule, index) => (
                        <li key={index} className="flex gap-4 items-start text-sm font-light leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                            {rule}
                        </li>
                    ))}
                  </ul>
              </div>
          </div>
        </div>
        <div className="h-full min-h-[500px] rounded-[4rem] overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-1000">
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
    <footer className="bg-charcoal text-white pt-32 pb-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-4 gap-12 mb-20">
                <div className="col-span-2">
                    <h4 className="font-heading text-4xl font-bold mb-8">Generali's</h4>
                    <p className="text-xl font-light opacity-60 leading-relaxed max-w-md">Crafting unforgettable coastal experiences through authentic food, rhythmic nights, and heart-felt hospitality in the heart of Kilifi.</p>
                </div>
                <div>
                    <h4 className="font-heading text-2xl font-bold mb-8">Socials</h4>
                    <div className="flex flex-col space-y-4 opacity-60">
                        <a href="#" className="hover:text-primary transition-colors text-lg">Instagram</a>
                        <a href="#" className="hover:text-primary transition-colors text-lg">Facebook</a>
                        <a href="#" className="hover:text-primary transition-colors text-lg">TripAdvisor</a>
                    </div>
                </div>
                <div>
                    <h4 className="font-heading text-2xl font-bold mb-8">Quick Links</h4>
                    <div className="flex flex-col space-y-4 opacity-60">
                        <a href="#menu" className="hover:text-primary transition-colors text-lg">Menu</a>
                        <a href="#events" className="hover:text-primary transition-colors text-lg">Events</a>
                        <a href="#contact" className="hover:text-primary transition-colors text-lg">Reservation</a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 pt-12 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 uppercase tracking-widest">
                <span>&copy; {new Date().getFullYear()} Generali's Bar & Kitchen. All Rights Reserved.</span>
                <div className="flex items-center gap-8">
                    <span>Designed for the Coast</span>
                    <button onClick={onAdminClick} className="hover:text-white transition-colors">Admin</button>
                </div>
            </div>
        </div>
    </footer>
);

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);
    const toggleVisible = () => setVisible(window.scrollY > 300);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    useEffect(() => {
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-10 right-10 bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-all duration-500 hover:scale-110 active:scale-95 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
    );
};