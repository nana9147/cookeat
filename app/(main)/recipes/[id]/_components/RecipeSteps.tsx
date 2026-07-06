import { RecipeStep } from '../../types';
import RecipeStepItem from './RecipeStepItem';

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-dark-text mb-4">조리순서</h2>
      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <RecipeStepItem key={step.order} step={step} />
        ))}
      </div>
    </section>
  );
}
