interface BurgerIconProps {
  className?: string;
  isOpen?: boolean;
}

export const BurgerIcon = ({ className = '', isOpen = false }: BurgerIconProps) => {
  return (
    <svg
      className={`w-6 h-6 transition-transform duration-200 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isOpen ? (
        // X icon when menu is open
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        // Hamburger icon when menu is closed
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </>
      )}
    </svg>
  );
};
