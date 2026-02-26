import React from 'react';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`animate-pulse bg-slate-200 rounded-md ${className || ''}`} {...props}></div>
);

export const TableRowSkeleton = ({ rows = 5, cells = 5 }: { rows?: number; cells?: number }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-50">
        {[...Array(cells)].map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className={`h-4 bg-slate-200 rounded ${j === 0 ? 'w-4' : 'w-full'}`}></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const OrderTableSkeleton = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-50">
        <Skeleton className="h-5 w-5 rounded shrink-0" />
        <Skeleton className="h-4 w-24 shrink-0" /> 
        <Skeleton className="h-4 w-24 shrink-0" />
        <Skeleton className="h-4 w-32 flex-1" />
        <Skeleton className="h-4 w-20 shrink-0" />
        <Skeleton className="h-4 w-12 shrink-0" />
        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        <Skeleton className="h-4 w-24 shrink-0" />
        <Skeleton className="h-6 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden p-8">
       <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
       <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-40 h-40 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-6">
             <Skeleton className="h-12 w-full rounded-xl" />
             <Skeleton className="h-24 w-full rounded-xl" />
      </div>
       </div>
      </div>
    </div>
  );

export const FormSkeleton = () => (
  <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
       <div className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
             <Skeleton className="h-4 w-32" />
          </div>
       </div>
       <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
       </div>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[24px] border border-slate-200 space-y-6">
             <Skeleton className="h-6 w-32 mb-4" />
             <Skeleton className="h-12 w-full rounded-xl" />
             <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
        </div>
             <Skeleton className="h-32 w-full rounded-xl" />
        </div>
          <div className="bg-white p-8 rounded-[24px] border border-slate-200">
             <Skeleton className="h-6 w-32 mb-4" />
             <div className="flex gap-4">
                <Skeleton className="h-32 w-32 rounded-xl" />
                <Skeleton className="h-32 w-32 rounded-xl" />
                <Skeleton className="h-32 w-32 rounded-xl" />
        </div>
        </div>
      </div>
       <div className="space-y-6">
          <div className="bg-white p-8 rounded-[24px] border border-slate-200 space-y-6">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-12 w-full rounded-xl" />
             <Skeleton className="h-12 w-full rounded-xl" />
             <div className="h-px bg-slate-100 my-4" />
             <Skeleton className="h-12 w-full rounded-xl" />
          </div>
      </div>
    </div>
  </div>
  );
 
export const DetailSkeleton = () => (
  <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
     <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
           <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[24px] border border-slate-200">
              <Skeleton className="w-full aspect-video rounded-xl mb-4" />
              <div className="flex gap-4">
                 {[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
              </div>
            </div>
           <div className="bg-white p-8 rounded-[24px] border border-slate-200 space-y-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
           </div>
          </div>
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[24px] border border-slate-200 space-y-6">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                 <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-32" /></div>
                 <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16" /></div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[24px] border border-slate-200 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
     <div className="flex justify-between">
        <div className="flex gap-4">
           <Skeleton className="w-10 h-10 rounded-xl" />
           <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[24px] border border-slate-200 flex flex-col items-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-6" />
              <div className="w-full space-y-4">
                 <Skeleton className="h-10 w-full rounded-xl" />
                 <Skeleton className="h-10 w-full rounded-xl" />
              </div>
           </div>
           <div className="bg-white p-6 rounded-[24px] border border-slate-200 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full rounded-[24px]" />
              <Skeleton className="h-32 w-full rounded-[24px]" />
              <Skeleton className="h-32 w-full rounded-[24px]" />
                </div>
           <div className="bg-white p-6 rounded-[24px] border border-slate-200 h-96">
              <div className="flex justify-between mb-6">
                 <Skeleton className="h-6 w-40" />
                 <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-4">
                 {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );