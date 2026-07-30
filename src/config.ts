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
  scrubFramePathPrefixSmall: string;
  /**
   * Portada VERTICAL para móvil. Si está puesta, en móvil no se usa el scrub:
   * los 60 fotogramas son 16:9 y en una pantalla vertical o se recortaban al
   * 26 % o dejaban 300 px de franja. Con una imagen vertical la portada llena
   * la pantalla, se ahorra 1,37 MB y desaparecen los tirones en móvil.
   * Cadena vacía = volver al scrub también en móvil.
   */
  portadaMovil: string;
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
  headlineLines: ["Dando luz a las sombras", "Contando el odio desde el amor"],
  tagline: "Productora audiovisual — cortometrajes, largometrajes y contenido de marca",
  scrubFrameCount: 60,
  scrubFramePathPrefix: "/images/hero-scrub/f-",
  // Variante de 800x450 para móvil: los de escritorio son 1600x900 y suman
  // 3,36 MB, que en móvil saturaban la conexión y retrasaban las fotos.
  scrubFramePathPrefixSmall: "/images/hero-scrub-sm/f-",
  portadaMovil: "/images/hero-portada-movil.webp",
  zones: [
    { label: "Proyectos", href: "#portfolio" },
    { label: "Servicios", href: "#services" },
    { label: "Sobre Nosotros", href: "#about" },
  ],
};

// Sección NOSOTROS: una ficha por autor (foto alternando lado) y un bloque
// final de dúo. Las biografías largas alimentan el diálogo de "Ver biografía".
export interface AboutPerson {
  number: string;
  firstName: string;
  lastName: string;
  roles: string[];
  quote: string;
  intro: string;
  bio: string[];
  image: string;
  imageAlt: string;
  /**
   * Proporción real (ancho/alto) de la foto. El contenedor la adopta para que
   * `object-cover` no recorte NADA: con una altura fija, estas fotos casi
   * cuadradas se ampliaban un 40 % y salían descabezadas.
   */
  imageRatio: number;
  /** true = foto a la derecha (bloque en espejo) */
  mirrored: boolean;
}

export interface AboutTeam {
  label: string;
  headlineLines: string[];
  /** Tres columnas de párrafos, como en el diseño. Se apilan en móvil. */
  columns: string[][];
  /** Proporción real de la foto; ver AboutPerson.imageRatio. */
  imageRatio: number;
  closing: string;
  image: string;
  imageAlt: string;
}

export interface AboutConfig {
  /** Encabezado de la sección: sin esto, al entrar por el menú aparecía
      directamente la foto del primer autor sin decir dónde estabas. */
  sectionLabel: string;
  sectionHeading: string;
  people: AboutPerson[];
  team: AboutTeam;
}

export const aboutConfig: AboutConfig = {
  sectionLabel: "Quiénes somos",
  sectionHeading: "Sobre nosotros",
  people: [
    {
      number: "01",
      firstName: "Christian",
      lastName: "Sánchez",
      roles: ["Director", "Guionista", "Productor"],
      quote: "Las historias nacen mucho antes de que exista una cámara.",
      intro:
        "Nací contando historias desde distintos lenguajes: la interpretación, la música y la dirección. Con el tiempo entendí que todas hablaban de lo mismo: emocionar. Hoy mi mirada busca la luz que existe en cada personaje, incluso cuando habita la oscuridad.",
      bio: [
        "Director, actor, guionista, músico y cantante.",
        "Nace en Barcelona, donde comienza su desarrollo como artista plástico en la diplomatura de Diseño de producto.",
        'Su vida toma un giro inesperado en 2006 y empieza su carrera profesional como actor de musicales en títulos como "High School Musical", "Fiebre del Sábado Noche", "Hair" o "El Rey León". Protagoniza el musical de "Dirty Dancing" y "Ghost, el musical" tanto en Madrid como en su gira nacional, durante más de cinco años cada uno.',
        'En televisión empieza su recorrido con "La Pecera de Eva" en 2010, y protagoniza las series musicales "Dreamland" y "Yo quisiera" (Mediaset). Series para las que además compone las canciones del proyecto y con las que gira por España, convirtiendo a alguno de estos temas en los más sonados de "Los 40 Principales". Llega a crear uno de los himnos que Coca-Cola le encarga para su campaña de Navidad en 2013, y la canción corporativa de ese mismo año para el grupo Mediaset.',
        '"Gym Tony" (Cuatro), "Perdóname Señor" (Telecinco), "El Continental" (TVE1) o "Cupido" (Playz) son otros de los títulos en los que forma parte, en cine y televisión, como actor y director de casting, emprendiendo las labores de supervisión de postproducción en la productora "Gossip Events & Productions".',
        "Sus estudios de diseño e imagen le permiten desarrollarse como fotógrafo, y el desempeño en los diferentes departamentos artísticos y de producción le llevan a adentrarse, más tarde, en el mundo de la realización y la dirección.",
      ],
      image: "/images/nosotros/christian.webp",
      imageAlt: "Christian Sánchez, director de XALVAJE",
      imageRatio: 993 / 989,
      mirrored: false,
    },
    {
      number: "02",
      firstName: "Ángel",
      lastName: "Lara",
      roles: ["Director artístico", "Coreógrafo"],
      quote: "La emoción también se construye desde el silencio y el movimiento.",
      intro:
        "Mi lenguaje nace del cuerpo, del espacio y del ritmo. Busco la belleza en la tensión, en aquello que no necesita palabras para emocionar. Cada plano es una coreografía donde la sombra también cuenta una historia.",
      bio: [
        "Nace en Madrid y se forma en arte dramático y danza.",
        'Comienza su carrera de bailarín en compañías como la de Aida Gómez y el NBE, y logra entrar como cuerpo de baile y más tarde como solista del Ballet Nacional de España a lo largo de siete años.',
        'Ha participado en las películas "Iberia" de Carlos Saura y "Mi gran noche" de Álex de la Iglesia, y en televisión en programas como "La Voz", "La Voz Kids" y "OT", o series como "Dreamland".',
        'Más tarde se une al elenco de musicales como "Dirty Dancing" y forma parte de la producción teatral de "Esto no es la casa de Bernarda Alba" de Carlota Ferrer, así como de diversas óperas en el Teatro Real.',
        'Se encarga de la dirección artística además de ser el coreógrafo del programa de televisión "Buscando un sueño" (CMM).',
        "Crea piezas artísticas para el grupo Na'Art y La caja sensorial de Isaacdospuntos.",
        "Actualmente se encuentra en WAH Show, una de las experiencias musicales más exitosas de Madrid.",
      ],
      image: "/images/nosotros/angel.webp",
      imageAlt: "Ángel Lara, director artístico de XALVAJE",
      imageRatio: 1160 / 925,
      mirrored: true,
    },
  ],
  team: {
    label: "Nosotros",
    headlineLines: ["Dos miradas.", "Una misma historia."],
    columns: [
      [
        "Hay historias que nacen de una sola voz.",
        "Las nuestras nacen del diálogo.",
        "Durante años hemos aprendido a mirar el mismo mundo desde lugares distintos.",
        "A veces uno encontraba la luz mientras el otro descendía a las sombras.",
      ],
      [
        "Con el tiempo dejamos de ocupar siempre el mismo lugar. Aprendimos a intercambiar los papeles.",
        "A dirigir y dejarnos dirigir. A escuchar antes de responder. A sostener cuando el otro necesitaba avanzar.",
        "Comprendimos que ninguna mirada está completa por sí sola.",
      ],
      [
        "Porque la emoción necesita estructura. Y la estructura necesita emoción.",
        "La luz revela. La sombra da profundidad.",
        "Solo cuando ambas conviven aparece una historia capaz de permanecer.",
        "No somos dos personas haciendo cine. Somos una única mirada construida entre dos.",
      ],
    ],
    closing: "Eso es XALVAJE.",
    image: "/images/nosotros/juntos.webp",
    imageAlt: "Christian Sánchez y Ángel Lara, frente a frente",
    imageRatio: 731 / 1002,
  },
};

// REEL de la productora. No tiene sección propia: se abre desde el centro de la
// X en la pantalla de entrada. El material es de 640x360 (también el .mov
// original, no hay mejor fuente), así que en el visor va a ancho contenido.
export interface ReelConfig {
  label: string;
  src: string;
  poster: string;
}

export const reelConfig: ReelConfig = {
  label: "Ver reel",
  src: "/videos/reel.mp4",
  poster: "/videos/reel-poster.jpg",
};

// Sección SERVICIOS: lista de cuatro servicios con el mismo lenguaje que
// NOSOTROS (fondo negro, número en rojo, título condensado, enlace subrayado).
// Sin iconos de librería a propósito: eran lo que daba aire de plantilla.
export interface ServiceItem {
  title: string;
  description: string;
  image: string;
  /** Ancla interna, si el servicio lleva a otra sección */
  link?: string;
  /** Texto del enlace; solo se usa si hay `link` */
  linkLabel?: string;
  /** Despliega la lista de marcas en lugar de navegar */
  brands?: string[];
}

export interface ServicesConfig {
  label: string;
  heading: string;
  brandsLabel: string;
  services: ServiceItem[];
}

export const servicesConfig: ServicesConfig = {
  label: "Servicios",
  heading: "Lo que ofrecemos",
  brandsLabel: "Marcas con las que hemos trabajado",
  services: [
    {
      title: "Producción Audiovisual",
      description: "Desde la idea hasta la pantalla. Cortometrajes, largometrajes, series y contenido digital con visión cinematográfica.",
      image: "/images/prisma-3.webp",
      link: "#portfolio",
      linkLabel: "Ver proyectos",
    },
    {
      title: "Fotografía",
      description: "Book artístico, fotografía de moda, retratos y cobertura de eventos con visión cinematográfica y atención al detalle.",
      image: "/images/service-2.webp",
      link: "#photography",
      linkLabel: "Ver fotografías",
    },
    {
      title: "Dirección de Arte",
      description: "Diseño visual, escenografía, vestuario y dirección artística para proyectos audiovisuales de alto impacto.",
      image: "/images/service-3.webp",
    },
    {
      title: "Marketing y contenido para marcas",
      description: "Estrategias de contenido visual, gestión de redes sociales, campañas publicitarias y branded content que conecta con tu audiencia.",
      image: "/images/objeto1.webp",
      brands: ["Apivita", "Belif", "Adidas", "Boss", "Camper"],
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
  /** Carrusel de fotos propio (solo para el proyecto destacado, ej. PRISMA) */
  carouselImages?: string[];
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
      image: "/images/prisma-carousel/prisma-cartel.webp",
      featured: true,
      carouselImages: [
        "/images/prisma-carousel/prisma-c1.webp",
        "/images/prisma-carousel/prisma-c2.webp",
        "/images/prisma-carousel/prisma-c3.webp",
        "/images/prisma-carousel/prisma-c4.webp",
        "/images/prisma-carousel/prisma-c5.webp",
        "/images/prisma-carousel/prisma-c6.webp",
        "/images/prisma-carousel/prisma-c7.webp",
      ],
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
      title: "Añadas en Reserva",
      category: "Cortometraje",
      year: "En producción",
      image: "/images/anadas-cartel.webp",
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
  // Vaciado a proposito: no habia pagina de listado a la que llevar.
  viewAllLabel: "",
};

// Testimonials section configuration
export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
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
    },
    {
      quote: "Trabajar con XALVAJE fue una experiencia extraordinaria. Capturaron la esencia de nuestro proyecto de manera que superó todas nuestras expectativas.",
      author: "Carlos Ruiz",
      role: "Productor",
      company: "Cine Independiente",
    },
    {
      quote: "El equipo de XALVAJE tiene una capacidad única para contar historias que conectan emocionalmente con la audiencia. Verdaderos artistas.",
      author: "Laura Martínez",
      role: "Guionista",
      company: "Narrativa Films",
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
