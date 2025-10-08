interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={`bg-muted ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Black Cat OSS. Built with FSD architecture.</p>
          <p className="mt-2 text-sm">React • TypeScript • Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};
