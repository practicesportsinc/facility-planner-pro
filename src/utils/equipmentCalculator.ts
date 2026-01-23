import { EquipmentInputs, EquipmentQuote, EquipmentCategory } from "@/types/equipment";
import { COST_LIBRARY } from "@/data/costLibrary";

export const calculateEquipmentQuote = (inputs: EquipmentInputs): EquipmentQuote => {
  const categories: EquipmentCategory[] = [];

  // Core Equipment Category
  const coreEquipment = calculateCoreEquipment(inputs);
  if (coreEquipment.items.length > 0) {
    categories.push(coreEquipment);
  }

  // Flooring/Surfaces Category
  const flooring = calculateFlooring(inputs);
  if (flooring.items.length > 0) {
    categories.push(flooring);
  }

  // Safety & Accessories Category
  const safety = calculateSafety(inputs);
  if (safety.items.length > 0) {
    categories.push(safety);
  }

  // Calculate totals
  const equipmentTotal = coreEquipment.subtotal + safety.subtotal;
  const flooringTotal = flooring.subtotal;
  const installationTotal = Math.round((equipmentTotal + flooringTotal) * 0.50); // 50% installation
  const grandTotal = equipmentTotal + flooringTotal + installationTotal;

  return {
    sport: inputs.sport,
    inputs,
    lineItems: categories,
    totals: {
      equipment: equipmentTotal,
      flooring: flooringTotal,
      installation: installationTotal,
      grandTotal,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      reliability: 'estimated',
    },
  };
};

const calculateCoreEquipment = (inputs: EquipmentInputs): EquipmentCategory => {
  const items: EquipmentCategory['items'] = [];

  switch (inputs.sport) {
    case 'baseball_softball':
      const cageItem = COST_LIBRARY.shell_cage;
      items.push({
        name: 'Batting Cages (70ft)',
        quantity: inputs.units,
        unitCost: cageItem.costTiers.mid,
        totalCost: inputs.units * cageItem.costTiers.mid,
      });

      const netItem = COST_LIBRARY.tunnel_net;
      items.push({
        name: 'Protective Netting',
        quantity: inputs.units * 2,
        unitCost: netItem.costTiers.mid,
        totalCost: inputs.units * 2 * netItem.costTiers.mid,
      });

      if (inputs.specialFeatures?.includes('Pitching mounds')) {
        items.push({
          name: 'Portable Pitching Mounds',
          quantity: inputs.units,
          unitCost: 1200,
          totalCost: inputs.units * 1200,
        });
      }

      if (inputs.specialFeatures?.includes('Hitting lab')) {
        items.push({
          name: 'Hitting Analysis Technology',
          quantity: 1,
          unitCost: 15000,
          totalCost: 15000,
        });
      }
      break;

    case 'basketball':
      const hoopItem = COST_LIBRARY['basketball-hoop'];
      if (hoopItem) {
        items.push({
          name: 'Professional Basketball Hoops',
          quantity: inputs.units * 2,
          unitCost: hoopItem.costTiers.mid,
          totalCost: inputs.units * 2 * hoopItem.costTiers.mid,
        });
      }

      items.push({
        name: 'Court Striping & Lines',
        quantity: inputs.units,
        unitCost: 2500,
        totalCost: inputs.units * 2500,
      });
      break;

    case 'volleyball':
      const vbNetItem = COST_LIBRARY['volleyball-net'];
      if (vbNetItem) {
        const costMultiplier = inputs.tournamentGrade ? 1.5 : 1;
        items.push({
          name: inputs.tournamentGrade ? 'Tournament Grade Net Systems' : 'Volleyball Net Systems',
          quantity: inputs.units,
          unitCost: vbNetItem.costTiers.mid * costMultiplier,
          totalCost: inputs.units * vbNetItem.costTiers.mid * costMultiplier,
        });
      }

      const standardsItem = COST_LIBRARY['volleyball-standards'];
      if (standardsItem) {
        items.push({
          name: 'Net Standards & Posts',
          quantity: inputs.units,
          unitCost: standardsItem.costTiers.mid,
          totalCost: inputs.units * standardsItem.costTiers.mid,
        });
      }
      break;

    case 'pickleball':
      const pbNetItem = COST_LIBRARY['pickleball-net'];
      if (pbNetItem) {
        items.push({
          name: 'Pickleball Net Systems',
          quantity: inputs.units,
          unitCost: pbNetItem.costTiers.mid,
          totalCost: inputs.units * pbNetItem.costTiers.mid,
        });
      }

      items.push({
        name: 'Court Striping & Lines',
        quantity: inputs.units,
        unitCost: 800,
        totalCost: inputs.units * 800,
      });

      // Different net type based on indoor/outdoor selection
      if (inputs.indoorOutdoor === 'outdoor') {
        items.push({
          name: 'In-Ground or Surface Mount Pickleball Nets',
          quantity: inputs.units,
          unitCost: 700,
          totalCost: inputs.units * 700,
        });
      } else {
        items.push({
          name: 'Portable Pickleball Nets',
          quantity: inputs.units,
          unitCost: 400,
          totalCost: inputs.units * 400,
        });
      }
      break;

    case 'soccer_indoor_small_sided':
      items.push({
        name: 'Soccer Goals (regulation)',
        quantity: inputs.units * 2,
        unitCost: 2500,
        totalCost: inputs.units * 2 * 2500,
      });
      break;

    case 'football':
      items.push({
        name: 'Football Goals',
        quantity: 2,
        unitCost: 8000,
        totalCost: 16000,
      });
      break;

    default:
      items.push({
        name: 'Multi-Sport Equipment Package',
        quantity: 1,
        unitCost: 25000,
        totalCost: 25000,
      });
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    category: 'Core Equipment',
    items,
    subtotal,
  };
};

const calculateFlooring = (inputs: EquipmentInputs): EquipmentCategory => {
  const items: EquipmentCategory['items'] = [];

  // Estimate square footage based on sport and units
  let sqft = 0;
  const spaceMultiplier = inputs.spaceSize === 'small' ? 0.8 : inputs.spaceSize === 'large' ? 1.2 : 1;

  switch (inputs.sport) {
    case 'baseball_softball':
      sqft = inputs.units * 1200 * spaceMultiplier; // ~1200 SF per cage
      if (inputs.turfInstallation) {
        const turfItem = COST_LIBRARY['turf-field'];
        if (turfItem) {
          items.push({
            name: 'Artificial Turf Installation',
            quantity: sqft,
            unitCost: turfItem.costTiers.mid,
            totalCost: sqft * turfItem.costTiers.mid,
          });
        }
      }
      break;

    case 'basketball':
      sqft = inputs.units * 5000 * spaceMultiplier; // ~5000 SF per court
      const courtCostMap: Record<string, number> = {
        hardwood: 12,
        'sport-tile': 8,
        modular: 5,
      };
      const costPerSF = courtCostMap[inputs.flooringType || 'sport-tile'];
      items.push({
        name: `${inputs.flooringType === 'hardwood' ? 'Hardwood' : inputs.flooringType === 'modular' ? 'Modular' : 'Sport Tile'} Flooring`,
        quantity: sqft,
        unitCost: costPerSF,
        totalCost: sqft * costPerSF,
      });
      break;

    case 'volleyball':
      sqft = inputs.units * 3000 * spaceMultiplier; // ~3000 SF per court
      const vbFlooringCostMap: Record<string, number> = {
        wood: 12,
        'sport-tile': 8,
        rubber: 6,
      };
      const vbCostPerSF = vbFlooringCostMap[inputs.flooringType || 'sport-tile'];
      items.push({
        name: `${inputs.flooringType === 'wood' ? 'Wood' : inputs.flooringType === 'rubber' ? 'Rubber' : 'Sport Tile'} Flooring`,
        quantity: sqft,
        unitCost: vbCostPerSF,
        totalCost: sqft * vbCostPerSF,
      });
      break;

    case 'pickleball':
      sqft = inputs.units * 800 * spaceMultiplier; // ~800 SF per court
      
      // Check if concrete surface requested (outdoor only)
      if (inputs.specialFeatures?.includes('Concrete surface')) {
        const concreteCost = COST_LIBRARY['outdoor_concrete_court'];
        const costPerSF = concreteCost?.costTiers.mid || 12;
        items.push({
          name: 'Concrete Court Surface',
          quantity: sqft,
          unitCost: costPerSF,
          totalCost: sqft * costPerSF,
        });
      } else {
        // Original indoor/outdoor surface logic
        const pbCostPerSF = inputs.indoorOutdoor === 'outdoor' ? 6 : 8;
        items.push({
          name: `${inputs.indoorOutdoor === 'outdoor' ? 'Outdoor' : 'Indoor'} Court Surface`,
          quantity: sqft,
          unitCost: pbCostPerSF,
          totalCost: sqft * pbCostPerSF,
        });
      }
      break;

    case 'soccer_indoor_small_sided':
    case 'football':
    case 'multi_sport':
      sqft = 20000 * spaceMultiplier;
      const turfItem = COST_LIBRARY['turf-field'];
      if (turfItem) {
        items.push({
          name: 'Multi-Sport Turf Installation',
          quantity: sqft,
          unitCost: turfItem.costTiers.mid,
          totalCost: sqft * turfItem.costTiers.mid,
        });
      }
      break;
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    category: 'Flooring & Surfaces',
    items,
    subtotal,
  };
};

const calculateSafety = (inputs: EquipmentInputs): EquipmentCategory => {
  const items: EquipmentCategory['items'] = [];

  // Add basic safety equipment based on sport
  const paddingCost = COST_LIBRARY.safety_padding;
  
  switch (inputs.sport) {
    case 'baseball_softball':
      const baseballLinearFeet = inputs.units * 100;
      items.push({
        name: 'Wall Padding & Protection',
        quantity: baseballLinearFeet,
        unitCost: paddingCost.costTiers.mid,
        totalCost: baseballLinearFeet * paddingCost.costTiers.mid,
      });
      break;

    case 'basketball':
    case 'volleyball':
      const courtLinearFeet = inputs.units * 80;
      items.push({
        name: 'Wall Padding',
        quantity: courtLinearFeet,
        unitCost: paddingCost.costTiers.mid,
        totalCost: courtLinearFeet * paddingCost.costTiers.mid,
      });
      break;

  }

  // Add lighting estimate - skip for outdoor pickleball with dedicated lighting option
  const skipIndoorLighting = inputs.sport === 'pickleball' && inputs.indoorOutdoor === 'outdoor';
  
  if (!skipIndoorLighting) {
    const lightingItem = COST_LIBRARY['led-sports-lighting'];
    if (lightingItem) {
      const fixtureCount = inputs.units * 4; // ~4 fixtures per unit
      items.push({
        name: 'LED Sports Lighting',
        quantity: fixtureCount,
        unitCost: lightingItem.costTiers.mid,
        totalCost: fixtureCount * lightingItem.costTiers.mid,
      });
    }
  }

  // Outdoor pickleball lighting (pole-mounted)
  if (inputs.sport === 'pickleball' && 
      inputs.indoorOutdoor === 'outdoor' && 
      inputs.specialFeatures?.includes('Outdoor lighting')) {
    const outdoorLighting = COST_LIBRARY['outdoor_court_lighting'];
    if (outdoorLighting) {
      items.push({
        name: 'Outdoor Court Lighting',
        quantity: inputs.units,
        unitCost: outdoorLighting.costTiers.mid,
        totalCost: inputs.units * outdoorLighting.costTiers.mid,
      });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    category: 'Safety & Lighting',
    items,
    subtotal,
  };
};
