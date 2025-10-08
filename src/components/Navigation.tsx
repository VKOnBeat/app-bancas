"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart, 
  Calendar, 
  Box, 
  Users, 
  Building, 
  Menu,
  Home
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart },
  { id: 'registros', label: 'Registros', icon: Calendar },
  { id: 'lotes', label: 'Lotes', icon: Box },
  { id: 'recrutadores', label: 'Recrutadores', icon: Users },
  { id: 'bets', label: 'Casas de Aposta', icon: Building }
];

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const NavItems = () => (
    <>
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => handleNavigate(item.id)}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-muted/40">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 border-b">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Sistema Bancas</span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItems />
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">Sistema Bancas</span>
        </div>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex items-center gap-2 mb-6">
              <Home className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">Sistema Bancas</span>
            </div>
            <nav className="space-y-2">
              <NavItems />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}