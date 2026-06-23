import Image from 'next/image';
import { RecipeStep } from '../../types';

export default function RecipeStepItem({ step, isLast }: { step: RecipeStep; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
          {step.order}
        </div>
        {!isLast && <div className="flex-1 w-px bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm text-dark-text leading-relaxed mb-3 pt-1">{step.description}</p>
        {step.image && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-card-bg">
            <Image src={step.image} alt={`step ${step.order}`} fill className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
