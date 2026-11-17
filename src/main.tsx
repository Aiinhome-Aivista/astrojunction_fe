import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { initLanguage } from './i18n';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

function renderApp() {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
  );
}

// Resolve language before first paint to eliminate flash of English
initLanguage()
  .catch((err) => {
    console.warn('[i18n] Language initialization error:', err);
  })
  .finally(() => {
    renderApp();
  });

