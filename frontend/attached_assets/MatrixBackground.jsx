import { useEffect, useRef } from 'react';
import { useMobile } from '@/components/hooks/use-mobile';

const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const isMobile = useMobile();
  
  useEffect(() => {
    // Skip the matrix rain on mobile devices to save performance
    if (isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    // Matrix rain setup
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    
    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height);
    }
    
    // Characters to be used (binary + some special chars)
    const chars = '01TACMCTFHACKER$#@!*&%^';
    
    // Matrix rain animation
    const draw = () => {
      // Add semi-transparent black rectangle to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text color and font
      ctx.fillStyle = '#00FF41';
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Get random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move drop down or reset if it's at the bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };
    
    // Run the animation
    const animationInterval = setInterval(draw, 35);
    
    // Cleanup
    return () => {
      clearInterval(animationInterval);
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [isMobile]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1] opacity-10"
      aria-hidden="true"
    />
  );
};

export default MatrixBackground;