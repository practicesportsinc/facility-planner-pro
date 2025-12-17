import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { ChevronLeft, ChevronRight, Save, Zap, ArrowLeft } from "lucide-react";

// Wizard steps
import ProjectBasics from "@/components/calculator/steps/ProjectBasics";
import BuildMode from "@/components/calculator/steps/BuildMode";
import FacilityPlan from "@/components/calculator/steps/FacilityPlan";
import Equipment from "@/components/calculator/steps/Equipment";
import StaffingAndOpEx from "@/components/calculator/steps/StaffingAndOpEx";
import RevenuePrograms from "@/components/calculator/steps/RevenuePrograms";
import Financing from "@/components/calculator/steps/Financing";
import KpiResults from "@/components/calculator/steps/KpiResults";
import LeadCapture from "@/components/calculator/steps/LeadCapture";
import SourcingPlan from "@/components/calculator/steps/SourcingPlan";
import Results from "@/components/calculator/steps/Results";

const STEPS = [
  { id: 1, title: "Project Basics", component: ProjectBasics },
  { id: 2, title: "Build/Buy/Lease", component: BuildMode },
  { id: 3, title: "Facility Plan", component: FacilityPlan },
  { id: 4, title: "Equipment", component: Equipment },
  { id: 5, title: "Staffing & OpEx", component: StaffingAndOpEx },
  { id: 6, title: "Revenue Programs", component: RevenuePrograms },
  { id: 7, title: "Financing", component: Financing },
  { id: 8, title: "Financial Overview", component: KpiResults },
  { id: 9, title: "Sourcing Plan", component: SourcingPlan },
  { id: 10, title: "Contact Information", component: LeadCapture },
  { id: 11, title: "Complete Analysis", component: Results },
];

const Calculator = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const projectId = searchParams.get('projectId');
  const mode = searchParams.get('mode');
  const isQuickMode = mode === 'quick';
  const isWizardMode = mode === 'wizard';
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get preset data from location state (coming from Gallery)
  const presetData = location.state?.presetData;
  const presetId = location.state?.presetId;
  
  // Get equipment data from location state (coming from Equipment Quote upgrade)
  const equipmentData = location.state?.equipmentData;
  
  // If it's quick mode, start at the KPI Results step (step 8)
  const [currentStep, setCurrentStep] = useState(isQuickMode || isWizardMode ? 8 : 1);
  const [calculatorData, setCalculatorData] = useState({});

  // Load preset data if coming from Gallery
  useEffect(() => {
    if (presetData && presetId) {
      console.log('Loading preset:', presetId, presetData);
      
      // Map preset configuration to calculator format
      setCalculatorData({
        1: { // Project Basics
          projectName: `${presetData.name} Project`,
          location: '',
          selectedSports: [presetData.sport],
          currency: 'USD',
        },
        2: { // Build Mode
          buildMode: 'lease' // Default for presets
        },
        3: { // Facility Plan
          facilityType: 'lease',
          totalSquareFootage: presetData.configuration.grossSF.toString(),
          clearHeight: presetData.configuration.clearHeight.toString(),
          selectedSports: [presetData.sport],
          amenities: [],
          // Map sport-specific counts
          numberOfCourts: presetData.configuration.basketball_courts_full || 
                          presetData.configuration.volleyball_courts || 
                          presetData.configuration.pickleball_courts || '',
          numberOfCages: presetData.configuration.baseball_tunnels || '',
          numberOfFields: presetData.configuration.soccer_field_small || '',
          court_or_cage_counts: {
            basketball_courts_full: presetData.configuration.basketball_courts_full || 0,
            volleyball_courts: presetData.configuration.volleyball_courts || 0,
            pickleball_courts: presetData.configuration.pickleball_courts || 0,
            baseball_tunnels: presetData.configuration.baseball_tunnels || 0,
            soccer_field_small: presetData.configuration.soccer_field_small || 0,
          }
        },
        4: { // Equipment - defaults based on facility size
          equipmentCost: Math.round(presetData.configuration.grossSF * 15), // $15/sqft estimate
          installationEstimate: Math.round(presetData.configuration.grossSF * 3), // $3/sqft install
          equipmentTotal: Math.round(presetData.configuration.grossSF * 18),
        },
        5: { // Staffing & OpEx - defaults
          gmFte: '1',
          gmRate: '35',
          opsLeadFte: '1',
          opsLeadRate: '28',
          coachFte: '4',
          coachRate: '25',
          frontDeskFte: '2',
          frontDeskRate: '20',
          utilities: Math.round(presetData.configuration.grossSF * 2.5).toString(),
          insurance: Math.round(presetData.configuration.grossSF * 1.2).toString(),
          propertyTax: Math.round(presetData.configuration.grossSF * 0.8).toString(),
          maintenance: Math.round(presetData.configuration.grossSF * 1.5).toString(),
          marketing: '2000',
          software: '500',
          janitorial: Math.round(presetData.configuration.grossSF * 0.75).toString(),
          other: '800',
        },
        6: { // Revenue Programs - sport-specific defaults
          membershipBasic: presetData.sport === 'pickleball' ? '75' : '65',
          membershipBasicCount: '150',
          membershipPremium: '125',
          membershipPremiumCount: '100',
          membershipFamily: '175',
          membershipFamilyCount: '75',
          courtRentalRate: presetData.sport === 'basketball' ? '80' : '60',
          courtUtilization: '65',
          privateLessonRate: '75',
          privateLessonsPerWeek: '40',
          groupLessonRate: '25',
          groupLessonsPerWeek: '60',
        },
        7: { // Financing - lease defaults
          lease_terms: {
            base_rent_per_sf_year: 15,
            nnn_per_sf_year: 8,
            cam_per_sf_year: 2,
            lease_term_years: 10,
            free_rent_months: 3,
            tenant_improvement_allowance_per_sf: 25,
          }
        }
      });
      
      // Start at step 1 so users can review and customize all preset data
      setCurrentStep(1);
    }
  }, [presetId, presetData]);

  // Load data from equipment quote upgrade
  useEffect(() => {
    if (equipmentData?.fromEquipmentQuote) {
      console.log('Loading from equipment quote:', equipmentData);
      
      // Map space size to estimated square footage
      const spaceSizeToSqft: Record<string, number> = { 
        small: 8000, 
        medium: 16000, 
        large: 24000 
      };
      const estimatedSqft = spaceSizeToSqft[equipmentData.spaceSize] || 16000;
      
      // Determine court/cage counts based on sport
      const isCourtSport = ['basketball', 'volleyball', 'pickleball'].includes(equipmentData.sport);
      const isCageSport = ['baseball', 'softball', 'multi_baseball'].includes(equipmentData.sport);
      
      setCalculatorData({
        1: { // Project Basics
          projectName: `${equipmentData.sport.charAt(0).toUpperCase() + equipmentData.sport.slice(1)} Facility`,
          selectedSports: [equipmentData.sport],
          currency: 'USD',
        },
        2: { // Build Mode
          buildMode: 'lease'
        },
        3: { // Facility Plan
          facilityType: 'lease',
          totalSquareFootage: estimatedSqft.toString(),
          clearHeight: equipmentData.sport === 'basketball' ? '24' : '20',
          selectedSports: [equipmentData.sport],
          numberOfCages: isCageSport ? equipmentData.units : 0,
          numberOfCourts: isCourtSport ? equipmentData.units : 0,
          court_or_cage_counts: {
            baseball_tunnels: isCageSport ? equipmentData.units : 0,
            basketball_courts_full: equipmentData.sport === 'basketball' ? equipmentData.units : 0,
            volleyball_courts: equipmentData.sport === 'volleyball' ? equipmentData.units : 0,
            pickleball_courts: equipmentData.sport === 'pickleball' ? equipmentData.units : 0,
          }
        },
        4: { // Equipment - carry over exact totals from quote
          equipmentCost: equipmentData.totals.equipment + equipmentData.totals.flooring,
          installationEstimate: equipmentData.totals.installation,
          equipmentTotal: equipmentData.totals.grandTotal,
        },
      });
      
      setCurrentStep(1); // Start at step 1 for review
    }
  }, [equipmentData]);

  // Load data from localStorage (quick estimate or wizard)
  useEffect(() => {
    if (isQuickMode && projectId) {
      const savedData = localStorage.getItem(`ps:project:${projectId}`);
      if (savedData) {
        try {
          const projectData = JSON.parse(savedData);
          // Convert the project data to calculator format for display
          setCalculatorData({
            1: { // Project Basics
              projectName: projectData.scenario_name,
              location: `${projectData.location_city}, ${projectData.location_state_province}`,
              currency: projectData.currency,
              selectedSports: projectData.selectedSports || []
            },
            2: { // Build Mode
              buildMode: projectData.facility_plan.build_mode
            },
            3: { // Facility Plan
              ...projectData.facility_plan,
              // Convert amenities object to array format expected by FacilityPlan
              amenities: projectData.facility_plan.amenities ? 
                Object.entries(projectData.facility_plan.amenities)
                  .filter(([key, value]) => value === true)
                  .map(([key]) => key) : [],
              // Convert court_or_cage_counts to individual fields expected by FacilityPlan
              facilityType: projectData.facility_plan.build_mode || '',
              clearHeight: projectData.facility_plan.clear_height_ft?.toString() || '20',
              totalSquareFootage: projectData.facility_plan.total_sqft?.toString() || '',
              // Map court/cage counts from quick estimate format
              numberOfCourts: projectData.facility_plan.court_or_cage_counts?.basketball_courts_full || 
                             projectData.facility_plan.court_or_cage_counts?.volleyball_courts || 
                             projectData.facility_plan.court_or_cage_counts?.pickleball_courts || '',
              numberOfFields: projectData.facility_plan.court_or_cage_counts?.soccer_field_small || '',
              numberOfCages: projectData.facility_plan.court_or_cage_counts?.baseball_tunnels || '',
              // Add sports data for square footage recommendations
              selectedSports: projectData.selectedSports || []
            },
            4: { // Equipment
              equipmentCost: projectData.equipmentPackage?.total || 0,
              installationEstimate: projectData.equipmentPackage?.installationEstimate || 0,
              equipmentTotal: projectData.equipmentPackage?.totalWithInstall || 0
            },
            5: { // Staffing & OpEx
              ...projectData.opex_inputs
            },
            6: { // Revenue Programs
              ...projectData.revenue_programs
            },
            7: { // Financing
              ...projectData.financing
            },
            10: projectData.lead ? { // Lead Capture data
              name: projectData.lead.name,
              email: projectData.lead.email,
              phone: projectData.lead.phone,
              city: projectData.lead.city,
              state: projectData.lead.state,
              outreach: projectData.lead.outreach
            } : undefined
          });
        } catch (error) {
          console.error('Error loading quick estimate data:', error);
        }
      }
    } else if (mode === 'wizard') {
      // Load wizard result data
      const wizardData = localStorage.getItem('wizard-result');
      if (wizardData) {
        try {
          const wizardResult = JSON.parse(wizardData);
          const responses = wizardResult.responses.reduce((acc: any, response: any) => {
            acc[response.questionId] = response.value;
            return acc;
          }, {});

          // Helper functions for data transformation
          const getTotalSqftFromWizard = (result: any): number => {
            if (result.recommendations?.suggestedSize) {
              return result.recommendations.suggestedSize;
            }
            if (responses.facility_size === 'custom' && responses.custom_facility_size) {
              return parseInt(responses.custom_facility_size);
            }
            // Size mapping fallback
            const sizeMap = { small: 12000, medium: 22000, large: 40000, xl: 60000 };
            return sizeMap[responses.facility_size as keyof typeof sizeMap] || 22000;
          };

          const computeCourtCounts = (selectedSports: string[], totalSqft: number) => {
            const sportSqftMap: Record<string, number> = {
              basketball: 6240,
              volleyball: 2592, 
              pickleball: 1800,
              baseball_softball: 1050,
              soccer: 14400
            };
            
            const programSqft = totalSqft * 0.8; // 80% for program space
            const counts: Record<string, number> = {};
            
            if (selectedSports.length === 1) {
              const sport = selectedSports[0];
              const unitSqft = sportSqftMap[sport] || 3000;
              counts[sport] = Math.max(1, Math.floor(programSqft / unitSqft));
            } else {
              // Multi-sport: distribute evenly
              const sqftPerSport = programSqft / selectedSports.length;
              selectedSports.forEach(sport => {
                const unitSqft = sportSqftMap[sport] || 3000;
                counts[sport] = Math.max(1, Math.floor(sqftPerSport / unitSqft));
              });
            }
            
            return counts;
          };

          const buildOpexDefaultsBySize = (totalSqft: number) => {
            const baseSqftMultiplier = totalSqft / 22000; // normalized to medium size
            
            return {
              fixedOperating: {
                utilities: Math.round(totalSqft * 2.5 * baseSqftMultiplier),
                insurance: Math.round(totalSqft * 1.2 * baseSqftMultiplier),
                property_tax: Math.round(totalSqft * 0.8 * baseSqftMultiplier),
                maintenance: Math.round(totalSqft * 1.5 * baseSqftMultiplier),
                marketing: Math.round(2000 * baseSqftMultiplier),
                software: Math.round(500 * baseSqftMultiplier),
                other: Math.round(800 * baseSqftMultiplier),
                janitorial: Math.round(totalSqft * 0.75 * baseSqftMultiplier)
              },
              staffing: [
                { role: 'GM', fte: 1, rate: 65000 },
                { role: 'Ops Lead', fte: 1, rate: 45000 },
                { role: 'Coach', fte: Math.round(2 * baseSqftMultiplier * 10) / 10, rate: 35000 },
                { role: 'Front Desk', fte: Math.round(1.5 * baseSqftMultiplier * 10) / 10, rate: 30000 }
              ]
            };
          };

          const buildRevenueDefaultsBySport = (primarySport: string, totalSqft: number) => {
            const baseSqftMultiplier = totalSqft / 22000;
            const memberBase = Math.round(totalSqft / 100 * baseSqftMultiplier); // 1 member per 100 sqft
            
            return {
              memberships: [
                { 
                  name: 'Adult Unlimited', 
                  count: Math.round(memberBase * 0.4), 
                  price: primarySport === 'pickleball' ? 75 : 65 
                },
                { 
                  name: 'Youth Programs', 
                  count: Math.round(memberBase * 0.35), 
                  price: 45 
                },
                { 
                  name: 'Drop-in Pass', 
                  count: Math.round(memberBase * 0.25), 
                  price: 25 
                }
              ],
              rentals: [
                { 
                  name: 'Court Rental', 
                  hours: Math.round(40 * baseSqftMultiplier), 
                  price: primarySport === 'basketball' ? 80 : 60 
                },
                { 
                  name: 'Field Rental', 
                  hours: Math.round(20 * baseSqftMultiplier), 
                  price: 120 
                }
              ],
              lessons: [
                { 
                  name: 'Private Lessons', 
                  count: Math.round(60 * baseSqftMultiplier), 
                  price: 75 
                },
                { 
                  name: 'Group Clinics', 
                  count: Math.round(40 * baseSqftMultiplier), 
                  price: 25 
                }
              ]
            };
          };

          // Extract data
          const selectedSports = Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport].filter(Boolean);
          const totalSquareFootage = getTotalSqftFromWizard(wizardResult);
          const courtCounts = computeCourtCounts(selectedSports, totalSquareFootage);
          const opexDefaults = buildOpexDefaultsBySize(totalSquareFootage);
          const revenueDefaults = buildRevenueDefaultsBySport(selectedSports[0] || 'multi_sport', totalSquareFootage);

          // Map wizard responses to calculator format
          setCalculatorData({
            1: { // Project Basics
              projectName: responses.facility_name || 'My Sports Facility',
              location: responses.location_type || '',
              selectedSports: selectedSports,
              stage_code: responses.project_stage || 'concept',
              budget: responses.budget_range || '',
              currency: 'USD',
              targetOpeningDate: ''
            },
            2: { // Build Mode
              buildMode: responses.build_mode || 'lease'
            },
            3: { // Facility Plan
              facilityType: responses.build_mode || 'lease',
              totalSquareFootage: totalSquareFootage.toString(),
              admin_pct_addon: 12,
              circulation_pct_addon: 20,
              clearHeight: '20',
              selectedSports: selectedSports,
              amenities: Array.isArray(responses.amenities) ? responses.amenities : [],
              // Court counts from computation
              numberOfCourts: courtCounts.basketball || courtCounts.volleyball || courtCounts.pickleball || '',
              numberOfFields: courtCounts.soccer || '',
              numberOfCages: courtCounts.baseball_softball || '',
              court_or_cage_counts: {
                basketball_courts_full: courtCounts.basketball || 0,
                volleyball_courts: courtCounts.volleyball || 0,
                pickleball_courts: courtCounts.pickleball || 0,
                baseball_tunnels: courtCounts.baseball_softball || 0,
                soccer_field_small: courtCounts.soccer || 0
              }
            },
            4: { // Equipment
              selectedProducts: responses.product_quantities?.selectedProducts || [],
              quantities: responses.product_quantities?.quantities || {}
            },
            5: { // Staffing & OpEx - Map to expected field names
              gmFte: '1',
              gmRate: '35',
              opsLeadFte: '1', 
              opsLeadRate: '28',
              coachFte: Math.max(1, Math.round(opexDefaults.staffing.find(s => s.role === 'Coach')?.fte || 2)).toString(),
              coachRate: '25',
              frontDeskFte: Math.max(1, Math.round(opexDefaults.staffing.find(s => s.role === 'Front Desk')?.fte || 1.5)).toString(),
              frontDeskRate: '20',
              // Fixed OpEx fields
              utilities: opexDefaults.fixedOperating.utilities.toString(),
              insurance: opexDefaults.fixedOperating.insurance.toString(),
              propertyTax: opexDefaults.fixedOperating.property_tax.toString(),
              maintenance: opexDefaults.fixedOperating.maintenance.toString(),
              marketing: opexDefaults.fixedOperating.marketing.toString(),
              software: opexDefaults.fixedOperating.software.toString(),
              janitorial: opexDefaults.fixedOperating.janitorial.toString(),
              other: opexDefaults.fixedOperating.other.toString()
            },
            6: { // Revenue Programs - Map to expected field names
              membershipBasic: '89',
              membershipBasicCount: revenueDefaults.memberships[0]?.count?.toString() || '150',
              membershipPremium: '149', 
              membershipPremiumCount: revenueDefaults.memberships[1]?.count?.toString() || '100',
              membershipFamily: '199',
              membershipFamilyCount: revenueDefaults.memberships[2]?.count?.toString() || '75',
              courtRentalRate: revenueDefaults.rentals[0]?.price?.toString() || '60',
              courtUtilization: '65',
              fieldRentalRate: revenueDefaults.rentals[1]?.price?.toString() || '100',
              fieldUtilization: '70',
              privateLessonRate: revenueDefaults.lessons[0]?.price?.toString() || '75',
              privateLessonsPerWeek: '40',
              groupLessonRate: revenueDefaults.lessons[1]?.price?.toString() || '25',
              groupLessonsPerWeek: '60'
            },
            7: { // Financing
              lease_terms: {
                base_rent_per_sf_year: 15,
                nnn_per_sf_year: 8,
                cam_per_sf_year: 2,
                lease_term_years: 10,
                free_rent_months: 3,
                tenant_improvement_allowance_per_sf: 25
              }
            }
          });
        } catch (error) {
          console.error('Error loading wizard data:', error);
        }
      }
    } else if (!isQuickMode && !isWizardMode) {
      // Custom mode - pre-seed steps 5 and 6 with defaults to avoid blank financials
      setCalculatorData(prevData => ({
        ...prevData,
        5: { // Staffing & OpEx defaults
          gmFte: '1',
          gmRate: '35',
          opsLeadFte: '1',
          opsLeadRate: '28',
          coachFte: '4',
          coachRate: '25',
          frontDeskFte: '2',
          frontDeskRate: '20',
          utilities: '2500',
          insurance: '1200',
          propertyTax: '1500',
          maintenance: '800',
          marketing: '1000',
          software: '350',
          janitorial: '600',
          other: '500',
          ...prevData[5] // Keep any existing data
        },
        6: { // Revenue Programs defaults
          individualPrice: '59',
          individualCount: '300',
          familyPrice: '99',
          familyCount: '120',
          rentalRate: '35',
          rentalHoursWeek: '40',
          rentalUtilization: '70',
          lessonCoaches: '3',
          lessonRate: '70',
          lessonHoursWeek: '15',
          lessonUtilization: '70',
          campsPerYear: '12',
          campPrice: '199',
          campCapacity: '30',
          campFillRate: '70',
          leaguesPerYear: '8',
          teamsPerLeague: '12',
          teamFee: '450',
          leagueMargin: '40',
          partiesPerMonth: '6',
          averagePartyNet: '225',
          jan: '85', feb: '90', mar: '100', apr: '110',
          may: '115', jun: '120', jul: '115', aug: '105',
          sep: '110', oct: '105', nov: '95', dec: '80',
          ...prevData[6] // Keep any existing data
        }
      }));
    }
  }, [isQuickMode, projectId, mode]);

  // Auto-scroll to content when in quick mode
  useEffect(() => {
    if (isQuickMode && contentRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [isQuickMode, currentStep]);

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const StepComponent = currentStepData?.component;
  
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleNavigateToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const updateData = (stepData: any) => {
    setCalculatorData(prev => ({
      ...prev,
      [currentStep]: stepData
    }));
  };

  // Allow saving data for any specific step (useful when a step needs to persist data to another step)
  const setDataForStep = (stepId: number, stepData: any) => {
    setCalculatorData(prev => ({
      ...prev,
      [stepId]: stepData,
    }));
  };
  return (
    <Layout className="py-8">
      <div className="container mx-auto px-4">
        {/* Progress Header */}
        <Card className="mb-8 shadow-custom-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {(isQuickMode || isWizardMode) && <Zap className="h-6 w-6 mr-2 text-primary" />}
                  {isQuickMode ? 'Quick Estimate Analysis' : isWizardMode ? 'Wizard Results Review' : 'Facility Budget Calculator'}
                </CardTitle>
                <CardDescription>
                  {isQuickMode 
                    ? 'Your instant facility projections • Customize any section for refined estimates'
                    : isWizardMode
                    ? 'Review and refine your facility recommendations'
                    : `Step ${currentStep} of ${STEPS.length}: ${currentStepData?.title}`
                  }
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isQuickMode ? 'Quick Estimate' : 'Auto-saved'}
              </Button>
            </div>
            {!isQuickMode && !isWizardMode && <Progress value={progress} className="h-2" />}
            {(isQuickMode || isWizardMode) && (
              <div className="bg-gradient-subtle border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {isQuickMode ? 'Quick Estimate Generated' : 'Wizard Recommendations Ready'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isQuickMode 
                        ? 'Your instant projections are ready for review. Navigate to any step to customize parameters for more accurate results.'
                        : 'Your facility recommendations have been pre-filled. Review and customize each section to refine your plan.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Back to Wizard Banner - only show in wizard mode */}
        {isWizardMode && (
          <Card className="mb-8 border border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Customizing your wizard recommendations
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Changed your mind? You can go back to the original wizard flow anytime
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Determine the last wizard step based on easy wizard stored data
                    const sportsData = localStorage.getItem('wizard-selected-sports');
                    const facilityData = localStorage.getItem('wizard-facility-size');
                    const productsData = localStorage.getItem('wizard-selected-products');
                    const locationData = localStorage.getItem('wizard-location');
                    
                    let lastStep = '/wizard/easy/start';
                    
                    if (sportsData && facilityData && productsData && locationData) {
                      // User completed all steps, go to results
                      lastStep = '/wizard/easy/results';
                    } else if (sportsData && facilityData && productsData) {
                      // User got to context step
                      lastStep = '/wizard/easy/context';
                    } else if (sportsData && facilityData) {
                      // User selected sports and size, go to products
                      lastStep = '/wizard/easy/products';
                    } else if (sportsData) {
                      // User selected sports, go to size
                      lastStep = '/wizard/easy/size';
                    }
                    
                    window.location.href = lastStep;
                  }}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full text-left p-3 rounded-md text-sm transition-smooth ${
                      step.id === currentStep
                        ? 'bg-primary text-primary-foreground shadow-custom-sm'
                        : step.id < currentStep
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-medium mr-3">
                        {step.id}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3" ref={contentRef}>
            <Card className="shadow-custom-lg">
              <CardContent className="p-8">
                {StepComponent && (
                  currentStep === 8 ? (
                    <KpiResults
                      data={calculatorData[currentStep] || {}}
                      onUpdate={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      allData={calculatorData}
                      onNavigateToStep={handleNavigateToStep}
                      setDataForStep={setDataForStep}
                    />
                  ) : currentStep === 11 ? (
                    <Results
                      data={calculatorData[currentStep] || {}}
                      onUpdate={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      allData={calculatorData}
                      setDataForStep={setDataForStep}
                    />
                  ) : (
                    <StepComponent
                      data={calculatorData[currentStep] || {}}
                      onUpdate={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      allData={calculatorData}
                    />
                  )
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="hero"
                onClick={handleNext}
                disabled={currentStep === STEPS.length}
              >
                {currentStep === STEPS.length ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calculator;