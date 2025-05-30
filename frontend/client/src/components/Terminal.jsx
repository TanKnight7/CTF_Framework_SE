import { useState, useEffect, useRef } from 'react';

const Terminal = ({ title = 'terminal.sh', lines = [], typing = false, typingSpeed = 25 }) => {
  const [visibleLines, setVisibleLines] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!typing) {
      setVisibleLines(lines);
      return;
    }

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    const allLines = [...lines];
    
    const typingInterval = setInterval(() => {
      if (currentLineIndex >= allLines.length) {
        clearInterval(typingInterval);
        return;
      }

      if (currentLineIndex === 0) {
        setVisibleLines([allLines[0]]);
        currentLineIndex++;
        return;
      }

      const currentLine = allLines[currentLineIndex];
      
      if (currentCharIndex === 0) {
        setVisibleLines(prev => [...prev, '']);
      }

      if (currentCharIndex < currentLine.length) {
        setVisibleLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = currentLine.substring(0, currentCharIndex + 1);
          return newLines;
        });
        currentCharIndex++;
      } else {
        currentCharIndex = 0;
        currentLineIndex++;
      }
      
      // Auto-scroll to the bottom as new content is added
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [lines, typing, typingSpeed]);

  return (
    <div className="terminal-container">
      {/* Terminal Title Bar */}
      <div className="terminal-title-bar">
        <div className="terminal-buttons">
          <span className="terminal-button terminal-button-close"></span>
          <span className="terminal-button terminal-button-minimize"></span>
          <span className="terminal-button terminal-button-maximize"></span>
        </div>
        <div className="terminal-title">{title}</div>
      </div>
      
      {/* Terminal Content */}
      <div className="terminal-content" ref={terminalRef}>
        {visibleLines.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
        <div className="terminal-cursor"></div>
      </div>
    </div>
  );
};

export default Terminal;