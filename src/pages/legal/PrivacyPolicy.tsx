import React from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import SEOHead from '@/components/seo/SEOHead';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <>
      <SEOHead
        title="プライバシーポリシー"
        description="mijfansのプライバシーポリシー。個人情報の取り扱い、Cookie利用、第三者提供などについて記載しています。"
        canonical="https://mijfans.jp/legal/privacy"
        keywords="プライバシーポリシー,個人情報保護,mijfans,プライバシー"
        type="website"
        noIndex={false}
        noFollow={false}
      />
      {/* <Header /> */}
      <AccountHeader
        title=""
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div
        style={{
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
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            fontSize: '28px',
            marginBottom: '40px',
            fontWeight: 'bold',
          }}
        >
          プライバシーポリシー
        </h1>

        <p>
          ウェブサービスである「mijfans」（以下「本サービス」といいます。）を運営するLinkle株式会社（以下「当社」といいます。）は、本サービスのユーザー（以下「ユーザー」といいます。）のプライバシーを尊重し、ユーザーの個人情報およびその他のユーザーのプライバシーに係る情報（以下「プライバシー情報」といいます。）の管理に細心の注意を払います。当社は、個人情報保護法をはじめとする各法令およびその他の規範を遵守してユーザーから収集した個人情報を適切に取り扱います。
        </p>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第1条（総則）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、個人情報保護法をはじめとする各法令およびその他の規範を遵守してユーザーから収集した個人情報を適切に取り扱います。
          <br />
          （2）当社は、個人情報を取り扱う体制の強化、SSL技術の導入等、ユーザーの個人情報の取り扱いについて、継続的な改善を図っています。
          <br />
          （3）ユーザーは、本サービスの利用に際して本ポリシーを熟読し、その内容を完全に理解した上で、これに同意するものとします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第2条（本ポリシーへの同意）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）ユーザーは、問い合わせ又は会員登録を通じて当社に自身のプライバシー情報を提供する場合、本ポリシーを熟読し、その内容に同意するものとします。
          <br />
          （2）ユーザーは、当社によるプライバシー情報の使用等について同意を撤回することができます。この場合、本サービスを継続利用することはできません。
          <br />
          （3）当社は、Cookie、IPアドレス、アクセスログ等のWEBトラッキング技術を活用してユーザーの行動や嗜好に関する情報を収集します。当社は、ユーザーが本サービスを利用した場合、当該ユーザーが当社によるこれらの技術を利用したプライバシー情報の収集について同意したものとみなします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第3条（収集するプライバシー情報）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、本サービスの提供に際して、ユーザーから以下の情報を収集または取得します。
          <br />
          <div className="indent" style={{ marginLeft: '20px' }}>
            1.
            ユーザーがフォーム等に入力することにより提供する情報：これには氏名、お問い合わせ等に関する情報、メールアドレス、年齢または生年月日等が含まれます。
            <br />
            2.
            Cookie、IPアドレス、アクセスログ等のWEBトラッキング技術、アクセス解析ツール等を介して当社がユーザーから収集する情報：これには利用端末やOS、ブラウザ等の接続環境に関する情報、ユーザーの行動履歴や閲覧履歴等に関する情報、購入した商品や閲覧した商品等のユーザーの嗜好に関する情報およびCookie情報が含まれます。なお、これらの情報にはユーザー個人を特定しうる個人情報に該当する情報は、含まれません。
          </div>
          （2）当社は、適法かつ公正な手段によってプライバシー情報を入手し、ユーザーの意思に反する不正な入手をしません。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第4条（プライバシー情報の利用目的）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          当社は、ユーザーから収集したプライバシー情報を本サービスの運営の目的のために使用します。主な利用目的は、以下のとおりです。
          <br />
          <div className="indent" style={{ marginLeft: '20px' }}>
            1. 本人確認、認証のため
            <br />
            2. ユーザー投稿コンテンツの決済のため
            <br />
            3. 売上金の振込のため
            <br />
            4. 利用規約やポリシーの変更等の重要な通知を送信するため
            <br />
            5. 本サービスのコンテンツやサービスの内容や品質の向上に役立てるため
            <br />
            6. アンケート、懸賞、キャンペーン等の実施のため
            <br />
            7. マーケティング調査、統計、分析のため
            <br />
            8. システムメンテナンス、不具合対応のため
            <br />
            9. 広告の配信およびその成果確認のため
            <br />
            10. 技術サポートの提供、お客様からの問い合わせ対応のため
            <br />
            11. 不正行為または違法となる可能性のある行為を防止するため
            <br />
            12. クレーム、紛争・訴訟等の対応のため
          </div>
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第5条（プライバシー情報の第三者提供）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、ユーザーの個人情報を第三者に開示または提供する場合、その提供先・提供情報内容を開示し、ユーザー本人の同意を得るものとします。なお、以下の場合を除き、ユーザー本人の事前の同意を得ることなく、個人情報を第三者に開示または提供することはありません。
          <br />
          <div className="indent" style={{ marginLeft: '20px' }}>
            1. 法令等の定めに基づいて開示等を請求された場合
            <br />
            2. 弁護士、検察、警察等から捜査に必要な範囲で開示等を請求された場合
            <br />
            3. 当社の関連会社間で情報を共有する場合
            <br />
            4. 本サービスの提供に必要な範囲で第三者に業務の一部を委託する場合
            <br />
            5. 本サービスの提供に必要な範囲内で決済代行会社に情報を提供する必要がある場合
          </div>
          （2）当社は、合併や分割等で当社の事業を第三者に譲渡する場合または本サービスの一部または全部を第三者に譲渡する場合、本サービスに係るユーザーの個人情報等を当該第三者に提供します。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第6条（年齢確認・本人確認）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービスの登録・利用は18歳以上に限ります。
          <br />
          （2）当社は、年齢確認のため、顔写真付き公的身分証（運転免許証、在留カード、パスポート等）の画像およびセルフィ（本人撮影画像）、生年月日その他当社所定の情報の提出を求めることがあります。
          <br />
          （3）個人番号（マイナンバー）の取得・保管は行いません。マイナンバーカードの番号記載面の提出は禁止します。
          <br />
          （4）当社は、提出情報に不足・不整合がある場合、追加書類の提出又は再提出を求めることができ、確認が完了するまでアカウントの利用制限・支払保留等の措置を行うことができます。
          <br />
          （5）当社は、リスク低減のため、同一人物による重複登録の確認その他の不正対策を目的として、提出情報をハッシュ化等の方法で照合することがあります。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第7条（本人確認情報の保管・削除）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、本人確認書類の画像データについては審査目的の範囲でのみ利用し、審査完了後は当社ポリシーに基づき一定期間（30日）内に自動削除します。
          <br />
          （2）当社は、証跡として生年月日、審査結果、審査日時、審査担当者、書類種別、識別子（免許証番号のハッシュ等）等の必要最小限のテキスト情報のみを保存します。
          <br />
          （3）本条に基づく本人確認情報の保存・管理方法、保存期間、削除方針は、当社プライバシーポリシーに従います。
          <br />
          （4）利用者が誤って個人番号（マイナンバー）を含む画像を提出した場合、当社は当該部分を受領せず、又は速やかに削除します。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第8条（虚偽・不正時の措置）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）提出情報が虚偽、不正取得、第三者の書類の流用であると当社が判断した場合、当社はアカウントの停止・解約、コンテンツ削除、支払の保留・没収相当の相殺等、必要な措置を講じます。
          <br />
          （2）当社は、必要に応じて警察、関係当局、決済事業者等と連携し、情報提供その他の対応を行うことができます。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第9条（プライバシー情報の管理、保管期間）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、ユーザーが本サービスを利用している期間中、当該ユーザーから開示または提供されたプライバシー情報の漏洩、改ざん等を防止するため、現時点での技術水準に合わせた必要かつ適切な安全管理措置を講じます。
          <br />
          （2）当社が保管するプライバシー情報を利用する必要がなくなった場合、当該プライバシー情報を遅滞なく消去するよう努めるものとします。また、ユーザーよりプライバシー情報の削除を要求された場合も、同様とします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第10条（ユーザーによる照会等への対応）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）ユーザーは、当社に対して、当社が保有する自身のプライバシー情報の開示、訂正、追加または削除、および利用停止を請求することができます。
          <br />
          （2）ユーザーは、当社が定める手段によって前項の開示等の請求をするものとします。なお、同請求は、ユーザー本人、法定代理人または当該請求につきユーザー本人より委任された代理人のみすることができます。
          <br />
          （3）当社は、開示等の請求を受けた場合、当社が定める手段によって本人確認したうえで、相当な期間内にこれに対応します。なお、当社は、法令に基づき開示等をしない決定をした場合、その旨をユーザーに通知するものとします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第11条（解析ツール等の使用）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、アクセス解析ツールを使用してユーザーの行動履歴等に関する情報を収集します。また、本サービスの提供に係るウェブサイト上に掲載される広告等の一部は、Cookieを利用した第三者の運営するサービスを利用して表示されます。
          <br />
          （2）ユーザーは、自身のブラウザ設定等からCookieを無効にする、それぞれの解析ツール、行動ターゲティング広告システムに係るWEBページからオプトアウトする等の手段により当社によるプライバシー情報の収集を拒否することができます。
          <br />
          （3）前項の設定の変更等は、ユーザー自身の自己責任にてなされるものとし、当社は、設定を変更したこと等により一部の情報が閲覧できない等、ユーザーに損害が生じた場合でも、一切責任を負わないものとします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第12条（SSL（Secure Socket Layer）について）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          当社のWebサイトはSSLに対応しており、WebブラウザとWebサーバーとの通信を暗号化しています。ユーザーが入力する氏名や住所、電話番号などの個人情報は自動的に暗号化されます。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第13条（本ポリシーの変更）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、自身の判断にて、本ポリシーを改定することができます。当社は、本ポリシーを改定する場合、緊急性がある場合を除き、事前に当社が適当であると判断する手段にてユーザーにその旨を通知するものとします。
          <br />
          （2）本ポリシーの改定は、改定後のプライバシーポリシーを本サービスにかかるWEBサイト上に掲載した時点で効力を生じるものとします。
          <br />
          （3）ユーザーは、本ポリシーの改定に同意することができない場合、当社に対して自身のプライバシー情報の削除を要求することができます。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第14条（準拠法・管轄裁判所）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本ポリシーは、日本国法に準拠して解釈されるものとします。
          <br />
          （2）ユーザーは、本ポリシーに関連して紛争等が発生した場合、東京地方裁判所において第一審の裁判を行うことにあらかじめ同意するものとします。
        </div>

        <div
          className="article-title"
          style={{
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '30px 0 15px 0',
          }}
        >
          第15条（管理責任者）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          当社では、個人情報の管理責任者を以下の者として、個人情報の適正な管理および個人情報保護に関する施策の継続的な改善を実施しています。なお、個人情報に関するお問い合わせ、ご相談、開示等の請求の窓口もこちらをご利用ください。
          <br />
          <div className="indent" style={{ marginLeft: '20px' }}>
            運営者: Linkle株式会社
            <br />
            所在地: 171-0021 東京都豊島区西池袋2-36-1ソフトタウン池袋913号
            <br />
            メールアドレス: support@mijfans.jp
          </div>
        </div>

        <div
          style={{
            marginTop: '40px',
            textAlign: 'center',
          }}
        >
          <strong>プライバシーポリシーの制定日及び改定日</strong>
          <br />
          制定: 2025年8月15日
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
