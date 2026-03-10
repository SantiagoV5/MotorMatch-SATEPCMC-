export default function MotorcycleSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-primary/5 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-40 bg-slate-200 dark:bg-slate-700"></div>
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
        
        {/* Specs */}
        <div className="flex gap-4 mb-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}