import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-stitch-surface-container-high/50 -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-stitch-gold transition-all duration-500 ease-in-out -z-10" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <div key={step} className="flex flex-col items-center gap-3">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "var(--stitch-gold)" : isCurrent ? "var(--stitch-surface-container-lowest)" : "var(--stitch-surface-container)",
                  borderColor: isCompleted || isCurrent ? "var(--stitch-gold)" : "var(--stitch-surface-container-high)"
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isCurrent ? 'ring-4 ring-stitch-gold/20' : ''}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-stitch-deep-blue" />
                ) : (
                  <span className={`text-sm font-bold font-manrope ${isCurrent ? 'text-stitch-gold' : 'text-muted-foreground'}`}>
                    0{index + 1}
                  </span>
                )}
              </motion.div>
              <div className="absolute -bottom-8 whitespace-nowrap hidden sm:block">
                <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent || isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                  {step}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
