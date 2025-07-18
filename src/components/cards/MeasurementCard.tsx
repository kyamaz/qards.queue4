// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';

type MeasurementCardProps = Omit<BaseCardProps, 'children'>

const MeasurementCard: React.FC<MeasurementCardProps> = (props) => {
  return (
    <BaseCard 
      {...props} 
      backgroundColor="bg-red-600"
    />
  );
};

export default MeasurementCard;