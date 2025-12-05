import React, { createContext, useContext, useState, useCallback } from 'react';
import { BusinessPlanData, DEFAULT_BUSINESS_PLAN } from '@/types/businessPlan';

interface BusinessPlanContextType {
  data: BusinessPlanData;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateData: <K extends keyof BusinessPlanData>(
    section: K,
    updates: Partial<BusinessPlanData[K]>
  ) => void;
  resetData: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  isStepComplete: (step: number) => boolean;
}

const BusinessPlanContext = createContext<BusinessPlanContextType | undefined>(undefined);

export function BusinessPlanProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BusinessPlanData>(DEFAULT_BUSINESS_PLAN);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = useCallback(<K extends keyof BusinessPlanData>(
    section: K,
    updates: Partial<BusinessPlanData[K]>
  ) => {
    setData(prev => {
      const currentSection = prev[section];
      const updatedSection = typeof currentSection === 'object' && currentSection !== null
        ? { ...currentSection, ...updates }
        : updates;
      return {
        ...prev,
        [section]: updatedSection,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const resetData = useCallback(() => {
    setData(DEFAULT_BUSINESS_PLAN);
    setCurrentStep(0);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 9));
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Project Overview
        return !!(data.projectOverview.facilityName && data.projectOverview.city && data.projectOverview.state);
      case 1: // Market Analysis
        return data.marketAnalysis.customerSegments.length > 0;
      case 2: // Sport Selection
        return data.sportSelection.primarySports.some(s => s.selected);
      case 3: // Competitive Analysis
        return !!(data.competitiveAnalysis.differentiationStrategy);
      case 4: // Facility Design
        return data.facilityDesign.totalSquareFootage > 0;
      case 5: // Programming
        return data.programming.rentalPricing.standardRate > 0;
      case 6: // Financials
        return data.financials.startupCosts.buildoutConstruction > 0;
      case 7: // Risk Assessment
        return data.riskAssessment.keyRisks.length > 0;
      case 8: // Timeline
        return !!(data.timeline.targetOpeningDate);
      case 9: // Review
        return true;
      default:
        return false;
    }
  }, [data]);

  return (
    <BusinessPlanContext.Provider
      value={{
        data,
        currentStep,
        setCurrentStep,
        updateData,
        resetData,
        goToNext,
        goToPrevious,
        isStepComplete,
      }}
    >
      {children}
    </BusinessPlanContext.Provider>
  );
}

export function useBusinessPlan() {
  const context = useContext(BusinessPlanContext);
  if (!context) {
    throw new Error('useBusinessPlan must be used within BusinessPlanProvider');
  }
  return context;
}
