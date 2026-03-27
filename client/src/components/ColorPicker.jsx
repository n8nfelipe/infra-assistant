import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

const ColorPicker = () => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();

  return (
    <div className="color-picker glass">
      <div className="picker-header">
        <Palette size={16} />
        <span>Tema do Projeto</span>
      </div>
      <div className="color-options">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            className={`color-blob ${currentTheme === key ? 'active' : ''}`}
            style={{ backgroundColor: theme.primary }}
            onClick={() => setCurrentTheme(key)}
            title={key.charAt(0) + key.slice(1)}
          >
            {currentTheme === key && <Check size={12} color="white" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
