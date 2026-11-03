import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Home } from './pages/Home';
import { ModelManager } from './pages/ModelManager';
import { SavedSnippets } from './pages/SavedSnippets';
import { initOfflineSentinel } from './components/OfflineSentinel';

export const App: React.FC = () => {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const fetchInitialData = useAppStore((state) => state.fetchInitialData);

  useEffect(() => {
    // Check initial hash route
    const hash = window.location.hash.replace('#', '');
    if (hash === 'models' || hash === 'snippets' || hash === 'editor') {
      setActiveTab(hash as any);
    }

    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'models' || h === 'snippets' || h === 'editor') {
        setActiveTab(h as any);
      }
    };
    window.addEventListener('hashchange', onHashChange);

    // Activate strict offline network sentinel
    initOfflineSentinel();
    // Load initial model list, history, and preferences
    fetchInitialData();

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [fetchInitialData, setActiveTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      <Header />

      {activeTab === 'editor' && <Home />}
      {activeTab === 'models' && <ModelManager />}
      {activeTab === 'snippets' && <SavedSnippets />}

      <SettingsModal />
    </div>
  );
};

export default App;
