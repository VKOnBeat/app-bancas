"use client";

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Registros from '@/components/Registros';
import Lotes from '@/components/Lotes';
import Recrutadores from '@/components/Recrutadores';
import Bets from '@/components/Bets';
import { initializeSeedData } from '@/lib/seed-data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Inicializar dados de exemplo na primeira execução
    initializeSeedData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'registros':
        return <Registros onNavigate={handleNavigate} />;
      case 'lotes':
        return <Lotes onNavigate={handleNavigate} />;
      case 'recrutadores':
        return <Recrutadores onNavigate={handleNavigate} />;
      case 'bets':
        return <Bets onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="lg:pt-0 pt-16">
          <main className="p-4 lg:p-8">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}