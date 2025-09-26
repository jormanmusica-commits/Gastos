import React from 'react';

interface CategoryIconProps {
  iconName: string; // This will be an emoji string
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className }) => {
  // The component now just renders the emoji string.
  return (
    <span className={className} role="img" aria-label={`ícono de categoría ${iconName}`}>
      {iconName}
    </span>
  );
};

export default CategoryIcon;
