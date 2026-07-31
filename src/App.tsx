import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { PageNav } from '@/components/PageNav';
import { PageOverlay } from '@/components/PageOverlay';
import { Footer } from '@/sections/Footer';
import { Portada } from '@/pages/Portada';
import { Proyectos } from '@/pages/Proyectos';
import { QueOfrecemos } from '@/pages/QueOfrecemos';
import { QuienesSomos } from '@/pages/QuienesSomos';
import { Contacto } from '@/pages/Contacto';
import { usePageLoad } from '@/hooks/usePageLoad';

/** Al cambiar de página se empieza arriba, no donde estabas en la anterior. */
function ScrollAlCambiarDePagina() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

function Contenido() {
  const { pathname } = useLocation();
  const esPortada = pathname === '/';

  return (
    <div className="min-h-screen bg-black">
      <ScrollAlCambiarDePagina />

      {/* La portada lleva su barra transparente sobre el fotograma; las páginas
          interiores, la blanca con las secciones y el "volver". */}
      {esPortada ? <Navigation /> : <PageNav />}

      {/* Las interiores empiezan bajo la barra, que es fija */}
      <main className={esPortada ? undefined : 'pt-[4.5rem]'}>
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/que-ofrecemos" element={<QueOfrecemos />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          {/* Cualquier otra URL cae en la portada, no en una pantalla vacía */}
          <Route path="*" element={<Portada />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  const { showOverlay } = usePageLoad(500);

  return (
    <BrowserRouter>
      <PageOverlay isVisible={showOverlay} />
      <Contenido />
    </BrowserRouter>
  );
}

export default App;
