import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Sangh</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Made with care for Tirupati's communities
          </p>
        </div>
      </div>
    </footer>
  );
}
