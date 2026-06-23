import { RecipeStep } from '../../types';
import RecipeStepItem from './RecipeStepItem';

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-dark-text mb-4">조리순서</h2>
      <div>
        {steps.map((step, i) => (
          <RecipeStepItem key={step.order} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </section>
  );
}
