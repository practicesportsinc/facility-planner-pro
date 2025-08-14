import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FacilityWizard } from "@/components/wizard/FacilityWizard";
import { WizardResult } from "@/types/wizard";

const Wizard = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(true);

  const handleWizardComplete = (result: WizardResult) => {
    // Save wizard results to localStorage for use in calculator
    localStorage.setItem('wizard-result', JSON.stringify(result));
    console.log('Wizard completed with result:', result);
  };

  const handleClose = () => {
    setShowWizard(false);
    navigate('/');
  };

  if (!showWizard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FacilityWizard 
        onComplete={handleWizardComplete}
        onClose={handleClose}
      />
    </div>
  );
};

export default Wizard;