import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SampleStreemUploadArea from "@/features/shareVideo/componets/SampleStreemUploadArea";
import ThumbnailPreview from "@/features/shareVideo/componets/ThumbnailPreview";
import { SampleVideoSectionProps } from '@/features/shareVideo/types';

export default function SampleVideoSection({
	isSample,
	previewSampleUrl,
	sampleDuration,
	onSampleTypeChange,
	onFileChange,
	onRemove,
	onEdit,
}: SampleVideoSectionProps) {
	return (
		<div className="space-y-2 pr-5 pl-5 bg-white border-t  border-primary pt-5 pb-5">
			<Label htmlFor="sample-video" className="text-sm font-medium font-bold">
				<span className="text-primary mr-1">*</span>サンプル動画を設定する
			</Label>

			<RadioGroup 
				defaultValue="upload" 
				onValueChange={(value) => onSampleTypeChange(value as 'upload' | 'cut_out')} 
				className="space-y-2"
			>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="upload" id="sample-upload" />
					<Label htmlFor="sample-upload">サンプルから動画をアップロード</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="cut_out" id="sample-cut_out" />
					<Label htmlFor="sample-cut_out">本編動画から指定</Label>
				</div>
			</RadioGroup>

			<div className="flex items-center bg-secondary rounded-md space-x-4 p-5">
				{/* サンプル動画をアップロード */}
				{isSample === 'upload' && (	
					<div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
						{previewSampleUrl ? (
							<div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
								<div className="flex items-center justify-between w-full">
									<span className="text-sm font-medium font-bold">再生時間: {sampleDuration}</span>
									<Button 
										variant="default" 
										size="sm" 
										className="text-xs"
										onClick={onRemove}
									>動画を削除</Button>
								</div>
								<video
									src={previewSampleUrl}
									controls
								/>
							</div>
						) : (
							<div className="flex flex-col border border-primary rounded-md p-2 items-center justify-center w-full space-y-2">
								<SampleStreemUploadArea onFileChange={onFileChange} />
								<span className="text-sm font-medium font-bold text-primary">サンプル動画をアップロード</span>
								<p className="text-xs text-muted-foreground">ファイル容量500MBまで、最長5分の動画がアップロード可能です。</p>
							</div>
						)}
					</div>
				)}

				{isSample === 'cut_out' && (
					<div className="flex items-center w-full justify-between space-x-2">
						<Label htmlFor="sample-cut_out" className="text-sm font-medium font-bold">
							<span className="text-primary mr-1">*</span>サンプル動画を設定する
						</Label>
						<Button
							variant="default"
							size="sm"
							className="text-xs"
							onClick={onEdit}
						>編集</Button>
					</div>
				)}
			</div>
		</div>
	);
} 