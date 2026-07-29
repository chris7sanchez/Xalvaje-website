import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// La web abre SIEMPRE por el primer fotograma del hero. Sin esto el navegador
// restaura la posición de scroll anterior (al recargar o al volver atrás) y,
// como el hero ocupa 3,5 pantallas de scrub, la página aparecía a mitad de la
// secuencia: una imagen suelta que obligaba a rebobinar a mano.
// Tiene que ejecutarse aquí, antes del primer render: en un useEffect llega
// tarde y el navegador ya ha restaurado.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (window.location.hash.length <= 1) {
  // Con ancla en la URL (/#portfolio) el visitante quiere esa sección: no tocar.
  window.scrollTo(0, 0)
  document.body.scrollTop = 0
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
