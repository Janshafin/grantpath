import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAsync } from './hooks/useAsync';

// Mirrored validation schema matching the backend express-validator rules
const searchSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, "Zip code must be exactly 5 digits").optional().or(z.literal('')),
  gpa: z.number().min(0).max(5.0).optional(),
  major: z.string().optional(),
  extracurriculars: z.string().optional()
});

type SearchFormValues = z.infer<typeof searchSchema>;

const fetchScholarships = async (data: SearchFormValues) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${baseUrl}/api/find`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      // Convert comma-separated string to array for backend
      extracurriculars: data.extracurriculars ? data.extracurriculars.split(',').map(s => s.trim()) : []
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to find scholarships (${response.status})`);
  }

  return response.json();
};

export function ScholarshipSearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema)
  });

  // Utilize global useAsync hook for race conditions, loading, and error boundaries
  const { data: results, isLoading, error: apiError, execute: onSubmit } = useAsync(fetchScholarships);

  return (
    <div className="max-w-[500px] w-full mx-auto">
      {apiError && (
        <div className="mb-md p-sm bg-error-container text-on-error-container border-l-4 border-error">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
        <div className="space-y-xs">
          <label htmlFor="zipcode" className="font-button text-button text-on-surface block uppercase">Zip code</label>
          <input 
            {...register("zipCode")}
            id="zipcode" 
            type="text" 
            placeholder="Your zip code"
            disabled={isLoading}
            className="w-full p-sm border border-surface-container-highest bg-surface-container-lowest focus:border-on-surface"
          />
          {errors.zipCode && <span className="text-error font-label-sm">{errors.zipCode.message}</span>}
        </div>

        <div className="space-y-xs">
          <label htmlFor="gpa" className="font-button text-button text-on-surface block uppercase">GPA</label>
          <input 
            {...register("gpa", { valueAsNumber: true })}
            id="gpa" 
            type="number" 
            step="0.1"
            placeholder="e.g. 3.5"
            disabled={isLoading}
            className="w-full p-sm border border-surface-container-highest bg-surface-container-lowest focus:border-on-surface"
          />
          {errors.gpa && <span className="text-error font-label-sm">{errors.gpa.message}</span>}
        </div>

        {/* Global hook manages disabled lock state automatically */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary-container text-on-primary font-button text-button p-sm uppercase hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find my scholarships'}
        </button>
      </form>

      {results && (
        <div className="mt-md p-sm border border-success text-success">
          Found {results.count} scholarships!
        </div>
      )}
    </div>
  );
}
