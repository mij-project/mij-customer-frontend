import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DescriptionSectionProps } from '@/features/shareVideo/types';

export default function DescriptionSection({
	description,
	onChange,
}: DescriptionSectionProps) {
	return (
		<div className="bg-white border-b border-gray-200 space-y-2 pr-5 pl-5 pt-5 pb-5">
			<Label htmlFor="description" className="text-sm font-medium font-bold">
				<span className="text-primary mr-1">*</span>説明文
			</Label>
			<Textarea
				id="description"
				value={description}
				onChange={(e) => onChange(e.target.value)}
				placeholder="説明文を入力"
				className="resize-none border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:border-2 shadow-none"
			/>
		</div>
	);
} 