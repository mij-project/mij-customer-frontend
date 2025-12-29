import React from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/common/BottomNavigation';

export default function TimeSaleNotice() {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    fontFamily:
      "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
    lineHeight: 1.8,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    color: '#000',
    backgroundColor: '#fff',
    paddingTop: '100px',
    paddingBottom: '100px',
  };

  const h1Style: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '40px',
    fontWeight: 'bold',
  };

  const articleTitleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '30px 0 0 0',
  };

  const contentStyle: React.CSSProperties = { marginBottom: '30px' };
  const indentStyle: React.CSSProperties = { marginLeft: '20px' };

  return (
    <>
      <AccountHeader title="" showBackButton={true} onBack={() => navigate(-1)} />

      <div style={containerStyle}>
        <h1 style={h1Style}>タイムセール機能の注意点</h1>

        <div className="content" style={contentStyle}>
          タイムセール機能の注意点を以下に記載します。
        </div>

        {/* ・価格適用のルールについて */}
        <div className="article-title text-center" style={articleTitleStyle}>
          価格適用のルールについて
        </div>
        <div className="content" style={{ ...contentStyle, marginBottom: '20px' }}>
          <div className="indent" style={indentStyle}>
            価格はプラン加入した時点で確定します。
          </div>
          <div className="indent" style={indentStyle}>
            タイムセール設定前に加入したユーザーの価格は、そのまま継続されます。
          </div>
        </div>

        {/* ・更新時の価格について */}
        <div className="article-title text-center" style={articleTitleStyle}>
          更新時の価格について
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            タイムセール価格でプラン加入したユーザーは、次回以降の更新時も同じ価格が適用されます。
          </div>
          <div className="indent" style={indentStyle}>
            例：5,000円 → 4,000円で12月1日プラン加入 → 1月1日の更新も4,000円
          </div>
          <div className="indent" style={indentStyle}>
            ※タイムセール終了後も、更新価格はタイムセール価格となります。
          </div>
        </div>

        {/* ・タイムセールの終了について */}
        <div className="article-title text-center" style={articleTitleStyle}>
          タイムセールの終了について
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            タイムセール終了後は、新規プラン加入者のみ通常価格が適用されます。
          </div>
          <div className="indent" style={indentStyle}>
            既存プラン加入者の価格は変更されません。
          </div>
        </div>

        {/* ・設定変更について */}
        <div className="article-title text-center" style={articleTitleStyle}>
          設定変更について
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            タイムセール設定後に内容を変更・解除しても、既にプラン加入しているユーザーの価格は変更されません。
          </div>
          <div className="indent" style={indentStyle}>
            なお、タイムセール中にプラン・単品販売価格を変更した場合はタイムセールの設定が解除されます。
          </div>
        </div>

        {/* ・設定内容の確認について */}
        <div className="article-title text-center" style={articleTitleStyle}>
          設定内容の確認について
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            設定内容は必ず事前にご確認ください。
          </div>
          <div className="indent" style={indentStyle}>
            設定ミス等による売上減少・差額について、当社での補填・返金対応は行えません。
          </div>
        </div>

        {/* ・割引の併用について */}
        <div className="article-title text-center" style={articleTitleStyle}>
          割引の併用について
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            タイムセールは、他の割引・キャンペーンとの併用はできません。
          </div>
        </div>

        {/* ・価格反映のタイミング */}
        <div className="article-title" style={articleTitleStyle}>
          価格反映のタイミング
        </div>
        <div className="content" style={contentStyle}>
          <div className="indent" style={indentStyle}>
            設定内容の反映に時間がかかる場合があります。
          </div>
          <div className="indent" style={indentStyle}>
            反映前にプラン加入、単品購入された場合、反映前の価格が適用されることがあります。
          </div>
        </div>

        {/* ■保存ボタン直前に1行警告■（ページ内の目立つ注意として追加） */}
        <div
          style={{
            marginTop: '40px',
            padding: '14px 16px',
            border: '1px solid #f5c2c7',
            backgroundColor: '#fff5f5',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          価格はプラン加入時点で固定され、後から変更できません
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
