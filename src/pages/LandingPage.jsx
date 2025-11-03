import React, { useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const heroRef = useRef(null);
  const foodRefs = useRef([]);
  const ctaRef = useRef(null);

  const foodItems = [
    { name: "Midnight Maggi", img: "https://nfcihospitality.com/wp-content/uploads/2024/09/types-of-Maggi-Noodles.jpg", desc: "Steaming hot noodles that hit different at 2 AM" },
    { name: "Crispy Chips", img: "https://img.freepik.com/premium-photo/delicious-tasty-crispy-potato-chips-isolated-white-background_781325-2974.jpg", desc: "The perfect crunch for your late-night gaming sessions" },
    { name: "Spicy Kurkure", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcYk7BDNogNbq0AjG98nqo1w-lyhWrgzZ-Qw&s", desc: "Twisted snacks that pack a flavorful punch" },
    { name: "Sweet Biscuits", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-1mqR8rpK8IWx_sQfyJLclzJkhaKY_AB3Ow&s", desc: "Dunking perfection with your midnight tea or coffee" },
    { name: "Loaded Pasta", img: "https://s.lightorangebean.com/media/20240914160809/Spicy-Penne-Pasta_-done.png", desc: "Creamy, cheesy goodness when you need real comfort food" },
  ];

  useEffect(() => {
    // Hero animations
    if (heroRef.current) {
    const title = heroRef.current.querySelector('.hero-title');
    const subtitle = heroRef.current.querySelector('.hero-subtitle');
    const button = heroRef.current.querySelector('.hero-button');

    const tl = gsap.timeline();
    gsap.set([title, subtitle, button], { opacity: 0, y: 50 });

    tl.to(title, { opacity: 1, y: 0, duration: 1 })
      .to(subtitle, { opacity: 1, y: 0, duration: 1 }, "-=0.5")
      .to(button, { opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }, "-=0.5");
  }
    // Food item animations
    foodRefs.current.forEach((ref, index) => {
  if (ref) {
    const isEven = index % 2 === 0;
    gsap.set(ref, { opacity: 0, x: isEven ? -120 : 120 });

    ScrollTrigger.create({
      trigger: ref,
      start: "top 85%",
      animation: gsap.to(ref, {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: index * 0.1, // slight stagger
      }),
      toggleActions: "play none none none",
    });
  }
});

    // CTA animation
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 50 });
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: "top 80%",
        animation: gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 1 }),
        toggleActions: "play none none none",
      });
    }
  }, []);

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="hero-title mb-6">
          <h1 className="text-5xl md:text-8xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
            NIGHT
          </h1>
          <h1 className="text-5xl md:text-8xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent -mt-4">
            CANTEEN
          </h1>
          <div className="flex items-center justify-center mt-4">
            <span className="text-4xl md:text-6xl animate-bounce">🍜</span>
          </div>
        </div>
        
        <p className="hero-subtitle text-lg md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
          When midnight strikes and hunger calls, we answer. 
          <span className="text-orange-400 font-semibold"> Premium late-night cravings </span>
          delivered to your doorstep in minutes.
        </p>

        <button 
          className="hero-button mt-10 px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-2xl text-xl font-bold hover:from-orange-500 hover:to-red-500 transform hover:scale-105 transition-all duration-300 border-2 border-orange-400/50 hover:border-orange-400 glow-button"
          onClick={() => window.location.href = '/home'}
        >
          <span className="flex items-center gap-2">
            Order Now 
            <span className="animate-pulse">🔥</span>
          </span>
        </button>
      </section>

      {/* Food Showcase */}
      <section className="relative z-10 px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text">
            Midnight Menu
          </h2>
          <p className="text-gray-400 text-lg mt-4">Crafted to satisfy your deepest cravings</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-20">
          {foodItems.map((item, index) => (
            <div
              key={item.name}
              ref={el => foodRefs.current[index] = el}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
            >
              <div className="flex-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-500"></div>
                <img
                  src={item.img}
                  alt={item.name}
                  className="relative w-full h-80 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl md:text-5xl font-black text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text mb-4">
                  {item.name}
                </h3>
                <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="inline-flex items-center gap-2 text-orange-400 font-semibold hover:text-orange-300 cursor-pointer transition-colors">
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative z-10 py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 to-red-900/30"></div>
        <div className="relative">
          <h2 className="text-4xl md:text-7xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text mb-8">
            Craving Satisfied?
          </h2>
          <p className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
            Don't let hunger wait. Your midnight feast is just one click away.
          </p>
          
          <button
            onClick={() => window.location.href = '/home'}
            className="relative px-16 py-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white rounded-full shadow-2xl text-2xl font-black hover:from-orange-500 hover:via-red-500 hover:to-orange-500 transform hover:scale-110 transition-all duration-300 border-2 border-orange-400/50 hover:border-orange-400 animate-pulse hover:animate-none"
          >
            <span className="flex items-center gap-3">
              🔥 START ORDERING 🔥
            </span>
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur-lg opacity-50 -z-10 animate-pulse"></div>
          </button>

          <div className="mt-8 flex justify-center items-center gap-8 text-sm text-gray-400">
            <span>⚡ Fast Delivery</span>
            <span>🌙 24/7 Available</span>
            <span>🔥 Always Hot</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .glow-button {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.5);
        }
        .glow-button:hover {
          box-shadow: 0 0 30px rgba(251, 146, 60, 0.8);
        }
        
        @media (max-width: 768px) {
          .hero-title h1 {
            font-size: 3rem;
            line-height: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
