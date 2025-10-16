import React, { useRef, useState } from 'react';

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
}

/**
 * Interactive angle visualizer component
 * 
 * Displays a circle with a rotating diameter that can be dragged
 * to change the gradient angle. Shows current angle value in center.
 */
export const AngleVisualizer: React.FC<AngleVisualizerProps> = ({
  angle,
  onChange,
  size = 120,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Convert angle to radians for SVG coordinates
  const angleRad = ((angle - 90) * Math.PI) / 180; // -90 to make 0° point right
  const x1 = centerX + radius * Math.cos(angleRad);
  const y1 = centerY + radius * Math.sin(angleRad);
  const x2 = centerX - radius * Math.cos(angleRad);
  const y2 = centerY - radius * Math.sin(angleRad);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerXClient = rect.left + rect.width / 2;
    const centerYClient = rect.top + rect.height / 2;

    // Calculate angle from center to mouse position
    const dx = e.clientX - centerXClient;
    const dy = e.clientY - centerYClient;
    const mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const normalizedAngle = ((mouseAngle % 360) + 360) % 360;

    onChange(Math.round(normalizedAngle));
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
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
        className={`transition-all duration-150 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
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
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary transition-all duration-150"
        />

        {/* Draggable handle on end */}
        <circle
          cx={x1}
          cy={y1}
          r="8"
          fill="currentColor"
          className="text-primary transition-all duration-150 hover:r-10"
        />

        {/* Angle text in center */}
        <text
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          className="text-xs font-medium fill-current text-foreground"
        >
          {angle}°
        </text>
      </svg>

      <p className="text-xs text-muted-foreground text-center">
        Drag to rotate
      </p>
    </div>
  );
};
