import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border font-bold text-xl flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
          E
        </div>
        <span>EduVera</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="#" className="flex items-center space-x-3 p-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <Users className="w-5 h-5" />
          <span>Siswa & Santri</span>
        </Link>
        <Link href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <BookOpen className="w-5 h-5" />
          <span>Akademik</span>
        </Link>
        <Link href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <Settings className="w-5 h-5" />
          <span>Pengaturan</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-sidebar-border text-sm text-sidebar-foreground/70">
        EduVera MVP v1.0
      </div>
    </div>
  );
}
