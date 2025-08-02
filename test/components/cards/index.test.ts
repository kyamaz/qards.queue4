// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import {
  BaseCard,
  QubitCard,
  GateCard,
  UnitaryCard,
  MeasurementCard,
  ControlCard,
  TargetCard,
  EmptySlot,
  CardComponent,
  BaseCardProps
} from '../../../src/components/cards';

describe('Card Components Index Exports', () => {
  describe('Component Exports', () => {
    it('should export BaseCard component', () => {
      expect(BaseCard).toBeDefined();
      expect(typeof BaseCard).toBe('function');
    });

    it('should export QubitCard component', () => {
      expect(QubitCard).toBeDefined();
      expect(typeof QubitCard).toBe('function');
    });

    it('should export GateCard component', () => {
      expect(GateCard).toBeDefined();
      expect(typeof GateCard).toBe('function');
    });

    it('should export UnitaryCard component', () => {
      expect(UnitaryCard).toBeDefined();
      expect(typeof UnitaryCard).toBe('function');
    });

    it('should export MeasurementCard component', () => {
      expect(MeasurementCard).toBeDefined();
      expect(typeof MeasurementCard).toBe('function');
    });

    it('should export ControlCard component', () => {
      expect(ControlCard).toBeDefined();
      expect(typeof ControlCard).toBe('function');
    });

    it('should export TargetCard component', () => {
      expect(TargetCard).toBeDefined();
      expect(typeof TargetCard).toBe('function');
    });

    it('should export EmptySlot component', () => {
      expect(EmptySlot).toBeDefined();
      expect(typeof EmptySlot).toBe('function');
    });

    it('should export CardComponent component', () => {
      expect(CardComponent).toBeDefined();
      expect(typeof CardComponent).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should export BaseCardProps type', () => {
      // Test that BaseCardProps can be used as a type
      const mockProps: BaseCardProps = {
        className: 'test-class',
        onClick: jest.fn(),
        isSelected: false,
        isHighlighted: false,
        children: 'Test content'
      };
      
      expect(mockProps.className).toBe('test-class');
      expect(typeof mockProps.onClick).toBe('function');
      expect(mockProps.isSelected).toBe(false);
    });
  });

  describe('Module Structure', () => {
    it('should export all expected card components', () => {
      const cardsModule = require('../../../src/components/cards');
      
      // Check all component exports exist
      const expectedExports = [
        'BaseCard',
        'QubitCard', 
        'GateCard',
        'UnitaryCard',
        'MeasurementCard',
        'ControlCard',
        'TargetCard',
        'EmptySlot',
        'CardComponent'
      ];
      
      expectedExports.forEach(exportName => {
        expect(cardsModule[exportName]).toBeDefined();
        expect(typeof cardsModule[exportName]).toBe('function');
      });
    });

    it('should have proper default exports structure', () => {
      // Test that all components are properly structured
      expect(BaseCard).toBeDefined();
      expect(QubitCard).toBeDefined();
      expect(GateCard).toBeDefined();
      expect(UnitaryCard).toBeDefined();
      expect(MeasurementCard).toBeDefined();
      expect(ControlCard).toBeDefined();
      expect(TargetCard).toBeDefined();
      expect(EmptySlot).toBeDefined();
      expect(CardComponent).toBeDefined();
    });
  });

  describe('Component Functionality', () => {
    it('should export working React components', () => {
      // All components should be valid React function components
      expect(typeof BaseCard).toBe('function');
      expect(typeof QubitCard).toBe('function');
      expect(typeof GateCard).toBe('function');
      expect(typeof UnitaryCard).toBe('function');
      expect(typeof MeasurementCard).toBe('function');
      expect(typeof ControlCard).toBe('function');
      expect(typeof TargetCard).toBe('function');
      expect(typeof EmptySlot).toBe('function');
      expect(typeof CardComponent).toBe('function');
    });

    it('should export consistent interface', () => {
      // Check that the main CardComponent export exists and is accessible
      expect(CardComponent).toBeDefined();
      expect(typeof CardComponent).toBe('function');
      
      // Check that BaseCardProps type can be imported and used
      expect(typeof BaseCard).toBe('function');
    });
  });
});