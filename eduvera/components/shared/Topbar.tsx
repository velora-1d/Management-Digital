import { Search, Bell, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Topbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari data..."
            className="pl-9 bg-muted/50 w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2 border-l border-border pl-4">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium">Ahmad Guru</div>
            <div className="text-xs text-muted-foreground">Admin Sekolah</div>
          </div>
          <UserCircle className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
