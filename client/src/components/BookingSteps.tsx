import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface BookingStepsProps {
  steps: Step[];
  currentStep: number;
}

export function BookingSteps({ steps, currentStep }: BookingStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                step.id < currentStep && "bg-primary border-primary",
                step.id === currentStep && "border-primary text-primary bg-primary/10",
                step.id > currentStep && "border-muted text-muted-foreground"
              )}
              data-testid={`step-indicator-${step.id}`}
            >
              {step.id < currentStep ? (
                <Check className="h-5 w-5 text-primary-foreground" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:block",
                step.id === currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-16 h-0.5 transition-colors duration-300",
                  step.id < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
