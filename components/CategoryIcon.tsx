import React from 'react';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ColombiaFlagIcon from './icons/ColombiaFlagIcon';
import BillIcon from './icons/BillIcon';
import EducationIcon from './icons/EducationIcon';
import GiftIcon from './icons/GiftIcon';
import MoneyBagIcon from './icons/MoneyBagIcon';
import PetIcon from './icons/PetIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import SubscriptionIcon from './icons/SubscriptionIcon';
import TravelIcon from './icons/TravelIcon';
import ScaleIcon from './icons/ScaleIcon';

interface CategoryIconProps {
  iconName: string;
  color: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, color, className = "w-5 h-5" }) => {
  const iconProps = { className, style: { color } };
  
  if (iconName === 'ColombiaFlag') return <ColombiaFlagIcon className={className} />;

  switch (iconName) {
    case 'Food': return <FoodIcon {...iconProps} />;
    case 'Transport': return <TransportIcon {...iconProps} />;
    case 'Clothing': return <ClothingIcon {...iconProps} />;
    case 'House': return <HouseIcon {...iconProps} />;
    case 'Entertainment': return <EntertainmentIcon {...iconProps} />;
    case 'Health': return <HealthIcon {...iconProps} />;
    case 'ArrowDown': return <ArrowDownIcon {...iconProps} />;
    case 'Scale': return <ScaleIcon {...iconProps} />;
    case 'Bill': return <BillIcon {...iconProps} />;
    case 'Education': return <EducationIcon {...iconProps} />;
    case 'Gift': return <GiftIcon {...iconProps} />;
    case 'MoneyBag': return <MoneyBagIcon {...iconProps} />;
    case 'Pet': return <PetIcon {...iconProps} />;
    case 'ShoppingCart': return <ShoppingCartIcon {...iconProps} />;
    case 'Subscription': return <SubscriptionIcon {...iconProps} />;
    case 'Travel': return <TravelIcon {...iconProps} />;
    case 'Tag':
    default:
      return <TagIcon {...iconProps} />;
  }
};

export default CategoryIcon;
