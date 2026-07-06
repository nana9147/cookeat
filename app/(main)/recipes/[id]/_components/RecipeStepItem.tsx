'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RecipeStep } from '../../types';

export default function RecipeStepItem({ step }: { step: RecipeStep }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
          {step.order}
        </div>
        {step.title && <p className="text-sm font-semibold text-dark-text">{step.title}</p>}
      </div>

      <div className="flex items-start gap-3">
        <p className="flex-1 min-w-0 text-sm text-dark-text leading-relaxed whitespace-pre-line">
          {step.description}
        </p>
        {step.image && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="relative w-20 h-20 tablet:w-24 tablet:h-24 shrink-0 rounded-xl overflow-hidden bg-background group"
              >
                <Image
                  src={step.image}
                  alt={`step ${step.order}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <Search className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:max-w-2xl p-1 bg-transparent border-none ring-0 shadow-none">
              <DialogTitle className="sr-only">STEP {step.order} 사진</DialogTitle>
              <DialogDescription className="sr-only">
                STEP {step.order} 조리 과정 사진 확대 보기
              </DialogDescription>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <Image
                  src={step.image}
                  alt={`step ${step.order} 확대 이미지`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {step.tip && (
        <div className="bg-yellow/10 border-l-4 border-yellow rounded-r-lg px-3 py-2 mt-3">
          <p className="text-xs font-semibold text-yellow mb-1">Tip</p>
          <p className="text-xs text-gray-text whitespace-pre-line">{step.tip}</p>
        </div>
      )}
    </div>
  );
}
