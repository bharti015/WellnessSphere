export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4 md:mb-0">
          © {new Date().getFullYear()} My Well-Being. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Help
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
}
