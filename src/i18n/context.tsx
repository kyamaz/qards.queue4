// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
'use client';

import { createContext } from 'react';
import { I18nContextType } from './types';

export const I18nContext = createContext<I18nContextType | undefined>(undefined);