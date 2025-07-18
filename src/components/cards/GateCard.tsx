// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';

type GateCardProps = Omit<BaseCardProps, 'children'>

const GateCard: React.FC<GateCardProps> = (props) => {
  return (
    <BaseCard 
      {...props} 
      backgroundColor="bg-blue-600"
    />
  );
};

export default GateCard;