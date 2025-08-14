import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Minus } from "lucide-react";

interface EquipmentProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const EQUIPMENT_BY_SPORT = {
  baseball: [
    { id: 'batting-cages', name: 'Batting Cages (per cage)', cost: 15000, quantity: 6 },
    { id: 'pitching-machines', name: 'Pitching Machines', cost: 3500, quantity: 4 },
    { id: 'protective-screens', name: 'Protective Screens', cost: 500, quantity: 8 },
    { id: 'batting-helmets', name: 'Batting Helmets', cost: 45, quantity: 20 },
    { id: 'batters-box-turf-mat', name: "Batter's Box Turf Mat", cost: 300, quantity: 6 },
  ],
  basketball: [
    { id: 'basketball-hoops', name: 'Basketball Hoops (adjustable)', cost: 2500, quantity: 8 },
    { id: 'basketballs', name: 'Basketballs', cost: 25, quantity: 20 },
    { id: 'scoreboard', name: 'Electronic Scoreboard', cost: 5000, quantity: 1 },
    { id: 'shot-clocks', name: 'Shot Clocks', cost: 1500, quantity: 2 },
  ],
  volleyball: [
    { id: 'volleyball-nets', name: 'Volleyball Net Systems', cost: 800, quantity: 4 },
    { id: 'volleyballs', name: 'Volleyballs', cost: 30, quantity: 15 },
    { id: 'referee-stands', name: 'Referee Stands', cost: 300, quantity: 2 },
    { id: 'antennas', name: 'Net Antennas', cost: 25, quantity: 8 },
  ],
  pickleball: [
    { id: 'pickleball-nets', name: 'Pickleball Net Systems', cost: 400, quantity: 6 },
    { id: 'pickleball-paddles', name: 'Pickleball Paddles', cost: 50, quantity: 20 },
    { id: 'pickleballs', name: 'Pickleballs', cost: 3, quantity: 100 },
    { id: 'court-lines', name: 'Court Line Tape/Paint', cost: 200, quantity: 6 },
  ],
  soccer: [
    { id: 'soccer-goals', name: 'Soccer Goals', cost: 1200, quantity: 4 },
    { id: 'soccer-balls', name: 'Soccer Balls', cost: 25, quantity: 30 },
    { id: 'corner-flags', name: 'Corner Flags', cost: 15, quantity: 16 },
    { id: 'field-turf', name: 'Artificial Turf (per sq ft)', cost: 8, quantity: 7000 },
  ],
};

const GENERAL_EQUIPMENT = [
  { id: 'sound-system', name: 'Sound System', cost: 8000, quantity: 1 },
  { id: 'lighting', name: 'LED Court Lighting (per fixture)', cost: 500, quantity: 20 },
  { id: 'storage-equipment', name: 'Equipment Storage Racks', cost: 300, quantity: 10 },
  { id: 'first-aid', name: 'First Aid Stations', cost: 200, quantity: 3 },
  { id: 'spectator-chairs', name: 'Spectator Chairs', cost: 75, quantity: 50 },
];

const Equipment = ({ data, onUpdate, onNext, onPrevious, allData }: EquipmentProps) => {
  const selectedSports = allData[1]?.selectedSports || [];
  const squareFootage = allData[2]?.totalSquareFootage || 0;
  
  // Initialize equipment list based on selected sports
  const getInitialEquipment = () => {
    let equipment: any[] = [];
    
    selectedSports.forEach((sport: string) => {
      const sportEquipment = EQUIPMENT_BY_SPORT[sport as keyof typeof EQUIPMENT_BY_SPORT] || [];
      equipment = [...equipment, ...sportEquipment];
    });
    
    equipment = [...equipment, ...GENERAL_EQUIPMENT];
    
    // Add artificial turf for baseball/softball
    if (selectedSports.includes('baseball') || selectedSports.includes('softball')) {
      const turfExists = equipment.some(item => item.id === 'artificial-turf');
      if (!turfExists) {
        equipment.push({
          id: 'artificial-turf',
          name: 'Artificial Turf',
          cost: 5,
          quantity: squareFootage || 25000,
          sport: 'baseball'
        });
      }
    }
    
    return equipment;
  };

  const [formData, setFormData] = useState({
    equipment: data.equipment || getInitialEquipment(),
    customEquipment: data.customEquipment || [],
    ...data
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const updatedEquipment = formData.equipment.map((item: any) =>
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    );
    
    const newData = { ...formData, equipment: updatedEquipment };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleCostChange = (id: string, newCost: number) => {
    const updatedEquipment = formData.equipment.map((item: any) =>
      item.id === id ? { ...item, cost: Math.max(0, newCost) } : item
    );
    
    const newData = { ...formData, equipment: updatedEquipment };
    setFormData(newData);
    onUpdate(newData);
  };

  const addCustomEquipment = (sport?: string) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: 'Custom Equipment',
      cost: 0,
      quantity: 1,
      isCustom: true,
      sport: sport || 'general',
    };
    
    const newData = {
      ...formData,
      equipment: [...formData.equipment, newItem]
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const removeEquipment = (id: string) => {
    const updatedEquipment = formData.equipment.filter((item: any) => item.id !== id);
    const newData = { ...formData, equipment: updatedEquipment };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleNameChange = (id: string, newName: string) => {
    const updatedEquipment = formData.equipment.map((item: any) =>
      item.id === id ? { ...item, name: newName } : item
    );
    
    const newData = { ...formData, equipment: updatedEquipment };
    setFormData(newData);
    onUpdate(newData);
  };

  const totalCost = formData.equipment.reduce((sum: number, item: any) => 
    sum + (item.cost * item.quantity), 0
  );

  const groupedEquipment = formData.equipment.reduce((groups: any, item: any) => {
    let sportKey = item.sport || selectedSports.find((sport: string) => 
      EQUIPMENT_BY_SPORT[sport as keyof typeof EQUIPMENT_BY_SPORT]?.some(eq => eq.id === item.id)
    ) || 'general';
    
    if (!groups[sportKey]) groups[sportKey] = [];
    groups[sportKey].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Equipment & Supplies</h2>
        <p className="text-muted-foreground">
          Review and customize your equipment list based on your selected sports
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedEquipment).map(([sport, items]) => (
            <Card key={sport}>
              <CardHeader>
                <CardTitle className="flex items-center capitalize">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  {sport === 'general' ? 'General Equipment' : `${sport} Equipment`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(items as any[]).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        {item.isCustom ? (
                          <Input
                            value={item.name}
                            onChange={(e) => handleNameChange(item.id, e.target.value)}
                            placeholder="Equipment name"
                          />
                        ) : (
                          <span className="font-medium">{item.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Cost:</Label>
                        <Input
                          type="number"
                          value={item.cost}
                          onChange={(e) => handleCostChange(item.id, Number(e.target.value))}
                          className="w-24"
                        />
                        {item.id === 'artificial-turf' && <span className="text-xs text-muted-foreground">per sq ft</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {item.id === 'artificial-turf' && <span className="text-xs text-muted-foreground">sq ft</span>}
                      </div>

                      <div className="text-right min-w-24">
                        <span className="font-bold">
                          ${(item.cost * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {item.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment(item.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addCustomEquipment(sport)} 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {sport === 'general' ? 'General' : sport.charAt(0).toUpperCase() + sport.slice(1)} Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Equipment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="font-medium">Total Equipment Cost:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{formData.equipment.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <span>{Object.keys(groupedEquipment).length}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  💡 Tip: Prices are estimates. Actual costs may vary by supplier, quality, and quantity discounts.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={onNext}>
          Continue to Site & Building Costs
        </Button>
      </div>
    </div>
  );
};

export default Equipment;