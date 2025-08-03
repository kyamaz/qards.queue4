// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { Card, CardType } from '../../game/types';
import QubitCard from './QubitCard';
import GateCard from './GateCard';
import UnitaryCard from './UnitaryCard';
import MeasurementCard from './MeasurementCard';
import ControlCard from './ControlCard';
import { TargetCard } from './TargetCard';
import EmptySlot from './EmptySlot';

interface CardComponentProps {
  card: Card | null;
  position: number;
  laneIndex?: number;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isAnimating?: boolean;
  isClickable?: boolean;
  className?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  position,
  laneIndex,
  onClick,
  isSelected = false,
  isHighlighted = false,
  isAnimating = false,
  isClickable = true,
  className
}) => {
  if (!card) {
    return (
      <EmptySlot
        position={position}
        laneIndex={laneIndex}
        onClick={onClick}
        isHighlighted={isHighlighted}
        isClickable={isClickable}
      />
    );
  }

  // Generate data-testid based on card type, position, and ID
  const getDataTestId = () => {
    const cardType = card.type.toLowerCase().replace('_', '-');
    if (laneIndex !== undefined) {
      return `board-card-${cardType}-lane${laneIndex}-pos${position}-id${card.id}`;
    }
    return `hand-card-${cardType}-id${card.id}`;
  };

  const commonProps = {
    value: card.value,
    onClick,
    isSelected,
    isHighlighted,
    isAnimating,
    isClickable,
    className,
    'data-testid': getDataTestId()
  };

  switch (card.type) {
    case CardType.QUBIT:
    case CardType.INITIAL_QUBIT:
      return <QubitCard {...commonProps} cardType={card.type} />;
    
    case CardType.GATE:
      return <GateCard {...commonProps} />;
    
    case CardType.UNITARY:
      return <UnitaryCard {...commonProps} />;
    
    case CardType.MEASUREMENT:
      return <MeasurementCard {...commonProps} card={card} />;
    
    case CardType.CONTROL:
      return (
        <ControlCard 
          {...commonProps} 
          targetLaneIndex={card.controlLink?.targetLaneIndex}
        />
      );
    
    case CardType.TARGET:
      return (
        <TargetCard 
          card={card} 
          onClick={onClick} 
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isAnimating={isAnimating}
          isClickable={isClickable}
          className={className}
          data-testid={getDataTestId()}
        />
      );
    
    default:
      return <EmptySlot position={position} laneIndex={laneIndex} onClick={onClick} isClickable={false} />;
  }
};

export default CardComponent;