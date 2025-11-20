import React from 'react';
import { Link } from 'react-router-dom';

export default function FooterSection() {
  return (
    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 m-4">
      <li>
        投稿されるコンテンツは、必ず当サービスの
        <Link to="/terms" className="text-primary underline hover:text-primary/80">
          利用規約
        </Link>
        に沿ってご利用ください。
      </li>
      <li>
        他者が権利を持つ作品を無断でアップロードする行為は著作権侵害にあたり、最長で「10年以下の懲役」または「1000万円以下の罰金」が科される可能性があります。
      </li>
      <li>
        性器や挿入部位などにモザイク処理がされていないコンテンツは、わいせつ物として扱われ法律違反となるため投稿は禁止です。
      </li>
      <li>
        適切なモザイク加工が確認できない場合、アカウント保護および法令遵守の観点から、投稿をすべて削除させていただくことがあります。
      </li>
    </ul>
  );
}
