import { Button } from '@/components/ui/button';
import { Plan } from '@/features/creater/types';

export default function PlanArea({ plans }: { plans: Plan[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex overflow-x-auto space-x-4 scrollbar-hide pb-2">
        {plans.map((plan) => (
          <div key={plan.id} className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {plan.isRecommended && (
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1">おすすめ</div>
              )}
              <div className="p-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {plan.thumbnails.slice(0, 7).map((thumbnail, index) => (
                    <img
                      key={index}
                      src={thumbnail}
                      alt=""
                      className="w-12 h-8 object-cover rounded"
                    />
                  ))}
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-2">{plan.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">投稿数 {plan.postCount}</div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">月額料金</div>
                    <div className="font-bold text-sm">
                      {plan.isFree ? (
                        <span className="text-green-600">¥0/月</span>
                      ) : (
                        <span>¥{plan.monthlyPrice.toLocaleString()}/月</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-white text-sm">
                  加入
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
