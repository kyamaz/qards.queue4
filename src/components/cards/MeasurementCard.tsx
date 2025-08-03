// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';
import { Card } from '../../game/types';
import { useTranslation } from '@/i18n';

interface MeasurementCardProps extends Omit<BaseCardProps, 'children'> {
  card?: Card;
}

const MeasurementCard: React.FC<MeasurementCardProps> = ({ card, ...props }) => {
  const { t } = useTranslation();
  
  return (
    <BaseCard 
      {...props} 
      backgroundColor="bg-red-600"
    >
      {card?.measurementResult && (
        <div className="text-xs text-cyan-200 mt-1">
          {t('cards.measurementValue')}{card.measurementResult}
        </div>
      )}
    </BaseCard>
  );
};

export default MeasurementCard;