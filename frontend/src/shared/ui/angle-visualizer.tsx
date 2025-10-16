import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AngleVisualizerProps {
  /**
   * Current angle in degrees (0-360)
   */
  angle: number;
  /**
   * Callback when angle changes
   */
  onChange: (angle: number) => void;
  /**
   * Size of the visualizer in pixels
   */
  size?: number;
  /**
   * If true, component is read-only (no interaction)
   */
  readonly?: boolean;
}

/**
 * Interactive angle visualizer component
 * 
 * Displays a circle with a rotating diameter that can be dragged
 * to change the gradient angle. Shows current angle value in center.
 * Uses native DOM manipulation for smooth dragging without React re-renders.
 */
export const AngleVisualizer: React.FC<AngleVisualizerProps> = ({
  angle,
  onChange,
  size = 120,
  readonly = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const isDraggingRef = useRef(false);
  const [isDark, setIsDark] = useState(false);

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      // Only use class-based detection, ignore system preference
      const isDarkTheme = hasDarkClass;
      // console.log('Theme check:', { hasDarkClass, isDarkTheme });
      setIsDark(isDarkTheme);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  // Update visual elements directly in DOM without React re-render
  const updateVisualElements = useCallback((newAngle: number) => {
    const angleRad = ((newAngle - 90) * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(angleRad);
    const y1 = centerY + radius * Math.sin(angleRad);
    const x2 = centerX - radius * Math.cos(angleRad);
    const y2 = centerY - radius * Math.sin(angleRad);

    if (lineRef.current) {
      lineRef.current.setAttribute('x1', x1.toString());
      lineRef.current.setAttribute('y1', y1.toString());
      lineRef.current.setAttribute('x2', x2.toString());
      lineRef.current.setAttribute('y2', y2.toString());
    }

    if (handleRef.current) {
      handleRef.current.setAttribute('cx', x1.toString());
      handleRef.current.setAttribute('cy', y1.toString());
    }

    if (textRef.current) {
      textRef.current.textContent = `${newAngle}°`;
    }

    // Update background rectangle for better text visibility
    if (rectRef.current) {
      const textWidth = `${newAngle}°`.length * 8 + 8; // Approximate text width + padding
      const rectX = centerX - textWidth / 2;
      const rectY = centerY - 8;
      
      rectRef.current.setAttribute('x', rectX.toString());
      rectRef.current.setAttribute('y', rectY.toString());
      rectRef.current.setAttribute('width', textWidth.toString());
      rectRef.current.setAttribute('height', '16');
      
      // Set colors based on theme
      rectRef.current.setAttribute('fill', isDark ? 'white' : 'black');
    }

    // Update text color based on theme
    if (textRef.current) {
      textRef.current.setAttribute('fill', isDark ? 'black' : 'white');
    }
  }, [isDark, centerX, centerY, radius]);

  // Global mouse event handlers for continuous dragging
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerXClient = rect.left + rect.width / 2;
    const centerYClient = rect.top + rect.height / 2;

    // Calculate angle from center to mouse position
    const dx = e.clientX - centerXClient;
    const dy = e.clientY - centerYClient;
    const mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const normalizedAngle = ((mouseAngle % 360) + 360) % 360;

    // Update visuals immediately in DOM
    updateVisualElements(Math.round(normalizedAngle));
    
    // Notify parent component
    onChange(Math.round(normalizedAngle));
  }, [updateVisualElements, onChange]);

  const handleGlobalMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (svgRef.current) {
      svgRef.current.style.cursor = 'grab';
    }
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove]);

  // Update visuals when prop changes
  useEffect(() => {
    updateVisualElements(angle);
  }, [angle, isDark, updateVisualElements]);

  // Cleanup global event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readonly) return;
    
    isDraggingRef.current = true;
    if (svgRef.current) {
      svgRef.current.style.cursor = 'grabbing';
    }
    
    // Add global event listeners for continuous dragging
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // Handle initial click
    handleGlobalMouseMove(e.nativeEvent);
  };

  const handleMouseUp = () => {
    if (readonly) return;
    handleGlobalMouseUp();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readonly || !isDraggingRef.current) return;
    handleGlobalMouseMove(e.nativeEvent);
  };

  const handleMouseLeave = () => {
    // Don't stop dragging when mouse leaves SVG - continue globally
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`select-none ${readonly ? 'cursor-default' : 'cursor-grab'}`}
      >
        {/* Circle border */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/30"
        />

        {/* Rotating diameter line */}
        <line
          ref={lineRef}
          x1={centerX + radius}
          y1={centerY}
          x2={centerX - radius}
          y2={centerY}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary"
        />

        {/* Draggable handle on end */}
        <circle
          ref={handleRef}
          cx={centerX + radius}
          cy={centerY}
          r="8"
          fill="currentColor"
          className={`text-primary ${readonly ? '' : 'hover:r-10'}`}
        />

        {/* Background rectangle for text */}
        <rect
          ref={rectRef}
          x={centerX - 20}
          y={centerY - 8}
          width="40"
          height="16"
          rx="4"
          fill={isDark ? 'white' : 'black'}
          className="opacity-95"
        />

        {/* Angle text in center */}
        <text
          ref={textRef}
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          className="text-xs font-bold"
          fill={isDark ? 'black' : 'white'}
        >
          {angle}°
        </text>
      </svg>

    </div>
  );
};
