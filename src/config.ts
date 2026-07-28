// Site configuration
// XALVAJE Producciones - Productora Audiovisual

export interface SiteConfig {
  language: string;
  title: string;
  description: string;
}

export const siteConfig: SiteConfig = {
  language: "es",
  title: "XALVAJE - Productora Audiovisual",
  description: "Productora de aspectos, piezas y factores transformadores que cambien el mundo. Cortometrajes, largometrajes y contenido audiovisual.",
};

// Navigation configuration
export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  links: NavLink[];
  contactLabel: string;
  contactHref: string;
}

export const navigationConfig: NavigationConfig = {
  logo: "XALVAJE",
  links: [
    { label: "Nosotros", href: "#about" },
    { label: "Proyectos", href: "#portfolio" },
    { label: "Fotografía", href: "#photography" },
    { label: "Stills", href: "#stills" },
  ],
  contactLabel: "Contacto",
  contactHref: "#contact",
};

// Hero section configuration
export interface HeroZone {
  label: string;
  href: string;
}

export interface HeroConfig {
  name: string;
  roles: string[];
  backgroundImage: string;
  /** Titular poético, una línea por elemento del array */
  headlineLines: string[];
  /** Línea corta y clara: qué es Xalvaje, para quien no conoce la marca */
  tagline: string;
  /** Fotogramas del scroll-scrub: public/images/hero-scrub/f-001.webp ... f-0XX.webp */
  scrubFrameCount: number;
  scrubFramePathPrefix: string;
  /** Zonas clicables que aparecen sobre el último fotograma */
  zones: HeroZone[];
}

export const heroConfig: HeroConfig = {
  name: "XALVAJE",
  roles: ["Producción Audiovisual", "Dirección", "Fotografía", "Arte"],
  // Respaldo instantáneo mientras cargan los fotogramas: usamos el primer
  // fotograma real (no la foto antigua) para que nunca se vea una imagen
  // que no pertenece al hero nuevo, ni siquiera un instante.
  backgroundImage: "/images/hero-scrub/f-001.webp",
  headlineLines: ["Donde las sombras", "salen a la luz y se hacen historia"],
  tagline: "Productora audiovisual — cortometrajes, largometrajes y contenido de marca",
  scrubFrameCount: 60,
  scrubFramePathPrefix: "/images/hero-scrub/f-",
  zones: [
    { label: "Proyectos", href: "#portfolio" },
    { label: "Servicios", href: "#services" },
    { label: "Sobre Nosotros", href: "#about" },
  ],
};

// About section configuration
export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutImage {
  src: string;
  alt: string;
}

export interface AboutConfig {
  label: string;
  description: string;
  experienceValue: string;
  experienceLabel: string;
  stats: AboutStat[];
  images: AboutImage[];
}

export const aboutConfig: AboutConfig = {
  label: "Sobre Nosotros",
  description: '"Juntos creamos mundos donde la luz encuentra su camino"\n\nXALVAJE nació en 2020 de la unión de dos visiones creativas con una misma pasión: contar historias que trasciendan la pantalla y lleguen directamente al corazón del espectador.\n\nNuestro nombre representa la dualidad de la luz y la sombra, ese equilibrio perfecto entre lo salvaje y lo refinado que buscamos en cada proyecto. Somos cazadores de emociones, arquitectos de sueños visuales.\n\nDesde cortometrajes premiados hasta nuestro primer largometraje "PRISMA", cada proyecto es una oportunidad de explorar nuevas formas de narrativa visual y conectar con audiencias de manera auténtica.\n\nNuestra filosofía se basa en la colaboración, la experimentación y el compromiso con la excelencia artística. Cada historia merece ser contada de la mejor manera posible.',
  experienceValue: "5+",
  experienceLabel: "Años de\nexperiencia",
  stats: [
    { value: "10+", label: "Proyectos realizados" },
    { value: "3", label: "Premios ganados" },
  ],
  images: [
    { src: "/images/about-1.webp", alt: "Producción audiovisual" },
    { src: "/images/about-2.webp", alt: "Ángel Lara - Director" },
    { src: "/images/about-3.webp", alt: "Christian Sánchez - Director" },
    { src: "/images/about-4.webp", alt: "Equipo creativo" },
  ],
};

// Services section configuration
export interface ServiceItem {
  iconName: string;
  title: string;
  description: string;
  image: string;
}

export interface ServicesConfig {
  label: string;
  heading: string;
  services: ServiceItem[];
}

export const servicesConfig: ServicesConfig = {
  label: "Servicios",
  heading: "Lo que ofrecemos",
  services: [
    {
      iconName: "Camera",
      title: "Producción Audiovisual",
      description: "Desde la idea hasta la pantalla. Cortometrajes, largometrajes, series y contenido digital con visión cinematográfica.",
      image: "/images/prisma-3.webp",
    },
    {
      iconName: "Aperture",
      title: "Fotografía",
      description: "Book artístico, fotografía de moda, retratos y cobertura de eventos con visión cinematográfica y atención al detalle.",
      image: "/images/service-2.webp",
    },
    {
      iconName: "Palette",
      title: "Dirección de Arte",
      description: "Diseño visual, escenografía, vestuario y dirección artística para proyectos audiovisuales de alto impacto.",
      image: "/images/service-3.webp",
    },
    {
      iconName: "TrendingUp",
      title: "Marketing y creación de contenido para marcas",
      description: "Estrategias de contenido visual, gestión de redes sociales, campañas publicitarias y branded content que conecta con tu audiencia.",
      image: "/images/objeto1.webp",
    },
  ],
};

// Portfolio section configuration
export interface ProjectItem {
  title: string;
  category: string;
  year: string;
  image: string;
  hoverImage?: string;
  featured?: boolean;
  youtubeUrl?: string;
}

export interface PortfolioCTA {
  label: string;
  heading: string;
  linkText: string;
  linkHref: string;
}

export interface PortfolioConfig {
  label: string;
  heading: string;
  description: string;
  projects: ProjectItem[];
  cta: PortfolioCTA;
  viewAllLabel: string;
}

export const portfolioConfig: PortfolioConfig = {
  label: "Portfolio",
  heading: "Nuestros Proyectos",
  description: "Desde cortometrajes premiados hasta largometrajes, cada proyecto es una ventana a mundos únicos.",
  projects: [
    {
      title: "PRISMA",
      category: "Largometraje",
      year: "2021",
      image: "/images/prisma-3-new.webp",
      hoverImage: "/images/prisma-1.webp",
      featured: true,
    },
    {
      title: "El Viaje Continúa...",
      category: "Cortometraje premiado",
      year: "2022",
      image: "/images/viaje-1a.webp",
      hoverImage: "/images/viaje-1b.webp",
      youtubeUrl: "https://www.youtube.com/watch?v=KE3xAOQLitA",
    },
    {
      title: "Pantera Rosa",
      category: "Cortometraje premiado",
      year: "2021",
      image: "/images/pantera-2a.webp",
      hoverImage: "/images/pantera-2b.webp",
      youtubeUrl: "https://www.youtube.com/watch?v=XBYdj9WHbXI",
    },
    {
      title: "El Mejor Regalo",
      category: "Cortometraje premiado",
      year: "2020",
      image: "/images/regalo-3a.webp",
      hoverImage: "/images/regalo-3b.webp",
      youtubeUrl: "https://www.youtube.com/watch?v=UObXpwbo0RQ",
    },
    {
      title: "Papá no es",
      category: "Cortometraje",
      year: "2020",
      image: "/images/papa-4a.webp",
      hoverImage: "/images/papa-4b.webp",
      youtubeUrl: "https://youtu.be/54oR1p9xxM8",
    },
    {
      title: "Vamos Tú Puedes",
      category: "Cortometraje",
      year: "2020",
      image: "/images/vamos-5a.webp",
      hoverImage: "/images/vamos-5b.webp",
      youtubeUrl: "https://www.youtube.com/watch?v=uzKOL_YLpF8",
    },
    {
      title: "En reserva",
      category: "Cortometraje",
      year: "En producción",
      image: "/images/reserva-6a.webp",
      hoverImage: "/images/reserva-6b.webp",
      youtubeUrl: "https://www.youtube.com/watch?v=JwBHxL6ZHUI",
    },
  ],
  cta: {
    label: "¿Tienes un proyecto?",
    heading: "Hagamos magia juntos",
    linkText: "Contáctanos",
    linkHref: "#contact",
  },
  viewAllLabel: "Ver Todos los Proyectos",
};

// Testimonials section configuration
export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  rating: number;
}

export interface TestimonialsConfig {
  label: string;
  heading: string;
  testimonials: TestimonialItem[];
}

export const testimonialsConfig: TestimonialsConfig = {
  label: "Testimonios",
  heading: "Lo que dicen de nosotros",
  testimonials: [
    {
      quote: "XALVAJE transformó nuestra visión en una realidad cinematográfica impresionante. Su atención al detalle y pasión por el arte es incomparable.",
      author: "María González",
      role: "Directora",
      company: "Arte Visual Studios",
      image: "/images/about-1.webp",
      rating: 5,
    },
    {
      quote: "Trabajar con XALVAJE fue una experiencia extraordinaria. Capturaron la esencia de nuestro proyecto de manera que superó todas nuestras expectativas.",
      author: "Carlos Ruiz",
      role: "Productor",
      company: "Cine Independiente",
      image: "/images/about-2.webp",
      rating: 5,
    },
    {
      quote: "El equipo de XALVAJE tiene una capacidad única para contar historias que conectan emocionalmente con la audiencia. Verdaderos artistas.",
      author: "Laura Martínez",
      role: "Guionista",
      company: "Narrativa Films",
      image: "/images/about-3.webp",
      rating: 5,
    },
  ],
};

// CTA section configuration
export interface CTAConfig {
  tags: string[];
  heading: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  email: string;
  backgroundImage: string;
}

export const ctaConfig: CTAConfig = {
  tags: ["Producción Audiovisual", "Dirección", "Fotografía", "Arte"],
  heading: "Hagamos magia",
  description: "¿Tienes un proyecto en mente? Nos encantaría escucharlo. Estamos siempre abiertos a nuevas colaboraciones y desafíos creativos. Juntos podemos crear algo extraordinario.",
  buttonText: "Enviar Mensaje",
  buttonHref: "mailto:info@xalvaje.com",
  email: "info@xalvaje.com",
  backgroundImage: "/images/cta-bg.webp",
};

// Footer section configuration
export interface FooterLinkColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  iconName: string;
  href: string;
  label: string;
}

export interface FooterConfig {
  logo: string;
  description: string;
  columns: FooterLinkColumn[];
  socialLinks: SocialLink[];
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  newsletterPlaceholder: string;
  copyright: string;
  credit: string;
}

export const footerConfig: FooterConfig = {
  logo: "XALVAJE",
  description: "Productora de aspectos, piezas y factores transformadores que cambien el mundo, -o por lo menos, que se lo hagan plantear.",
  columns: [
    {
      title: "Navegación",
      links: [
        { label: "Nosotros", href: "#about" },
        { label: "Proyectos", href: "#portfolio" },
        { label: "Servicios", href: "#services" },
        { label: "Contacto", href: "#contact" },
      ],
    },
    {
      title: "Servicios",
      links: [
        { label: "Producción Audiovisual", href: "#services" },
        { label: "Fotografía", href: "#services" },
        { label: "Dirección de Arte", href: "#services" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Política de Privacidad", href: "#" },
        { label: "Términos de Uso", href: "#" },
      ],
    },
  ],
  socialLinks: [
    { iconName: "Instagram", href: "https://instagram.com/xalvaje", label: "Instagram" },
    { iconName: "Youtube", href: "https://youtube.com/xalvaje", label: "YouTube" },
    { iconName: "Mail", href: "mailto:info@xalvaje.com", label: "Email" },
  ],
  newsletterHeading: "Mantente informado",
  newsletterDescription: "Suscríbete para recibir noticias sobre nuestros últimos proyectos y estrenos.",
  newsletterButtonText: "Suscribirse",
  newsletterPlaceholder: "Tu email",
  copyright: "© 2025 XALVAJE. Todos los derechos reservados.",
  credit: "Diseñado con pasión por el cine",
};
