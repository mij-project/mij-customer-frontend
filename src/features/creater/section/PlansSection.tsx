import { Button } from '@/components/ui/button';
import { Plan } from '@/features/creater/types';

export default function PlansSection({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {plan.isRecommended && (
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1">おすすめ</div>
          )}

          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {plan.thumbnails.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt=""
                  className="w-16 h-12 object-cover rounded"
                />
              ))}
            </div>

            <h3 className="font-medium text-gray-900 mb-2">{plan.title}</h3>

            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                <div>投稿数 {plan.postCount}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">月額料金</div>
                <div className="font-bold text-lg">
                  {plan.isFree ? (
                    <span className="text-green-600">無料</span>
                  ) : (
                    <span>¥{plan.monthlyPrice.toLocaleString()}/月</span>
                  )}
                </div>
              </div>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-white">加入</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
