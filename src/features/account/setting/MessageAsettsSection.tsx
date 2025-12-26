import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@/features/account/types';
export default function MessageAsettsSection({ accountInfo }: { accountInfo: AccountInfo }) {
  const navigate = useNavigate();

  return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
		<h3 className="font-medium text-gray-900 mb-4 text-center">送信メッセージ管理</h3>
		<div className="grid grid-cols-3 gap-2 text-center text-sm">
			<div>
				<div className="text-gray-600 whitespace-nowrap">審査中</div>
				<div className="font-medium">{accountInfo?.message_assets_info?.pending_count || 0}</div>
			</div>
			<div>
				<div className="text-red-500 whitespace-nowrap">要修正</div>
				<div className="font-medium text-red-500">{accountInfo?.message_assets_info?.reject_count || 0}</div>
			</div>
			<div>
				<div className="text-gray-600 whitespace-nowrap">予約中</div>
				<div className="font-medium">
					{accountInfo?.message_assets_info?.reserved_count || 0}
				</div>
			</div>
		</div>
		<div className="mt-4 text-center">
			<button className="text-pink-500 text-sm" onClick={() => navigate('/account/message')}>
				すべて見る &gt;
			</button>
		</div>
	</div>
  );
}