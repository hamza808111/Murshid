import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PasswordValidationPopupProps {
  password: string;
  isVisible: boolean;
}

interface ValidationRule {
  id: string;
  text: string;
  isValid: boolean;
}

const PasswordValidationPopup = ({ password, isVisible }: PasswordValidationPopupProps) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    { id: "length", text: "At least 8 characters", isValid: false },
    { id: "uppercase", text: "At least one uppercase letter", isValid: false },
    { id: "lowercase", text: "At least one lowercase letter", isValid: false },
  ]);

  useEffect(() => {
    const newRules = validationRules.map((rule) => {
      switch (rule.id) {
        case "length":
          return { ...rule, isValid: password.length >= 8 };
        case "uppercase":
          return { ...rule, isValid: /[A-Z]/.test(password) };
        case "lowercase":
          return { ...rule, isValid: /[a-z]/.test(password) };
        default:
          return rule;
      }
    });
    setValidationRules(newRules);
  }, [password]);

  if (!isVisible || password.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-border/50 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-2">Password Requirements:</h4>
          {validationRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-2 text-sm">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                rule.isValid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {rule.isValid ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </div>
              <span className={rule.isValid ? 'text-green-600' : 'text-muted-foreground'}>
                {rule.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordValidationPopup;
