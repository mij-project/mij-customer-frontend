import React from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';

export default function Terms() {
  return (
    <>
      <Header />
      <div
        style={{
          fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
          lineHeight: 1.8,
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          color: '#000',
          backgroundColor: '#fff',
          paddingTop: '100px',
          paddingBottom: '100px'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            fontSize: '28px',
            marginBottom: '40px',
            fontWeight: 'bold'
          }}
        >
          mijfans 利用規約
        </h1>

        <div className="content" style={{ marginBottom: '20px' }}>
          本利用規約（以下「本規約」といいます。）には、Linkle株式会社（以下「当社」といいます。）が提供するインターネットプラットフォーム「mijfans」における各種サービス（理由の如何を問わずサービスの名称又は内容が変更された場合は、当該変更後のサービスを含みます。以下「本サービス」といいます。）の利用に際して、第1条で定めるユーザーが遵守すべき事項及び当社とユーザー間の権利義務関係が定められています。本サービスをご利用になる方は、必ず本規約の全文をお読みいただき、本規約に同意の上、利用するものとする。本サービスの利用開始とともに、ユーザーは本規約の条件に同意したものとみなされます。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第1条（用語の定義）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          本規約において使用する用語の意味は、次のとおりとします。<br />
          （1）本プラットフォーム<br />
          <div className="indent" style={{ marginLeft: '20px' }}>当社が運営する下記URL配下のウェブサイトをいいます。ただし、URLは当社の都合により変更される場合があります。 https://mijfans.jp/</div>
          （2）ユーザー<br />
          <div className="indent" style={{ marginLeft: '20px' }}>ユーザーとは、本サービスを利用している全ての法人、個人事業主及び個人だけでなく、本サービスの利用を検討している全ての法人、個人事業主及び個人や、過去に本サービスを利用した全ての法人、個人事業主及び個人、本サービスの登録を抹消した全ての法人、個人事業主及び個人も含まれます。</div>
          （3）本サービス<br />
          <div className="indent" style={{ marginLeft: '20px' }}>本サービスとは、当社が運営するインターネットサービス「mijfans」をいいます。</div>
          （4）会員ユーザー<br />
          <div className="indent" style={{ marginLeft: '20px' }}>会員ユーザーとは、本規約に同意し、本サービスを利用するために当社が定めるユーザー登録を完了した全ての者を指します。</div>
          （5）コンテンツ<br />
          <div className="indent" style={{ marginLeft: '20px' }}>コンテンツとは、文章、音声、画像、動画その他の情報を指します。</div>
          （6）利用手数料<br />
          <div className="indent" style={{ marginLeft: '20px' }}>ユーザーが本システムを利用する際に当社に支払う手数料をいいます。これには、本システムの使用料、ならびに決済手段に応じて当社が別途定める追加利用手数料が含まれます。</div>
          （7）クレジット決済手数料<br />
          <div className="indent" style={{ marginLeft: '20px' }}>ユーザーが本システムにおいてクレジットカード決済を利用する際に発生する、クレジットカード会社又は決済代行会社に支払う手数料をいいます。これには、取引処理手数料（トランザクションフィー）、与信枠確保に伴うオーソリ手数料、決済処理料、国際ブランド手数料、チャージバックに伴う手数料その他クレジットカード決済に付随して発生する一切の費用が含まれ、ユーザーは契約するカード会社等の規約に従うものとします。</div>
          （8）本システム<br />
          <div className="indent" style={{ marginLeft: '20px' }}>本プラットフォーム及び本サービスを運営・稼動するために当社が使用するハードウェア及びソフトウェアの総称をいいます。</div>
          （9）本規約等<br />
          <div className="indent" style={{ marginLeft: '20px' }}>本規約、プライバシーポリシー及び本プラットフォーム上で当社が定めた本サービス利用のための諸条件の総称をいいます。</div>
          （10）本契約<br />
          <div className="indent" style={{ marginLeft: '20px' }}>本規約等に基づく当社とユーザーとの契約をいいます。</div>
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第2条（会員登録・管理）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービスの利用を希望する者は、本規約に同意の上、当社の定める方法により会員登録を申請することができます。<br />
          （2）本サービスは、会員登録の申請があった場合、当社所定の審査を行い、これを承認することができます。<br />
          （3）本サービスは、会員登録の申請者が以下の事由に該当する場合、会員登録を承認いたしません。<br />
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>申請に際して虚偽の事項を届け出た場合</li>
            <li style={{ marginBottom: '8px' }}>過去に本規約違反により会員資格を取り消された者である場合</li>
            <li style={{ marginBottom: '8px' }}>18歳未満の方</li>
            <li style={{ marginBottom: '8px' }}>反社会的勢力等に該当し、又は資金提供その他を通じて反社会的勢力等の維持、運営若しくは経営に協力若しくは関与する等反社会的勢力等との何らかの交流若しくは関与を行っていると当社が判断した場合</li>
            <li style={{ marginBottom: '8px' }}>その他、当社が登録を適当でないと判断した場合</li>
          </ol>
          （4）会員ユーザーは、会員登録時に提供した情報に変更があった場合、速やかに当社に届け出るものとします。<br />
          （5）会員ユーザーは、自己の責任において、アカウントのパスワード及びその他の認証情報を適切に管理するものとします。<br />
          （6）会員ユーザーは、パスワード及びその他の認証情報を第三者に開示してはならず、これらの情報が第三者に使用されることにより生じた損害については、当社は一切責任を負いません。<br />
          （7）18歳未満の方は本サービスをご利用いただけません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第3条（サービス内容）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービスは、コンテンツをユーザーに提供・販売するサービスです。<br />
          （2）本サービスを通じて提供されるコンテンツは、法令及び公序良俗に反しない適法なコンテンツに限定され、第16条に定める禁止コンテンツは提供しません。<br />
          （3）本サービスは、コンテンツの閲覧、視聴、ダウンロード等の利用方法について、技術的制限を設けることがあります。<br />
          （4）本サービスの具体的な機能や利用方法については、本サイト上に掲載される説明に従うものとします。<br />
          （5）当社は、本サービスの品質向上、システムの安定運用等を目的として、予告なくサービス内容を変更することがあります。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第4条（購入・代金・支払方法）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）会員ユーザーは、本サービスにおいてコンテンツを購入する際、当社が指定する方法により代金を支払うものとします。<br />
          （2）当社が指定する支払方法は、クレジットカード決済、その他当社が認める決済方法とします。<br />
          （3）代金の支払いが確認できない場合、本サービスは該当するコンテンツの提供を停止することがあります。<br />
          （4）決済時に決済代行会社等の第三者による審査が行われる場合があり、その結果によっては決済が承認されない場合があります。<br />
          （5）支払いに関して生じた手数料は、会員ユーザーの負担とします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第5条（価格・表示・消費税）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）コンテンツの価格は、本サービス上に表示される価格とします。<br />
          （2）表示価格には、別途明記する場合を除き、消費税が含まれます。<br />
          （3）本サービスは、経済情勢の変動、サービス内容の変更等により、予告なく価格を変更することがあります。<br />
          （4）価格変更は、変更後に購入されるコンテンツから適用され、既に購入済みのコンテンツには影響しません。<br />
          （5）外貨建てクレジットカードを使用する場合の為替レートは、決済代行会社の定めるレートが適用されます。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第6条（提供・視聴可能期間・利用条件）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）コンテンツは、代金の支払いが確認された後、当社が定める方法により提供されます。<br />
          （2）コンテンツの利用可能期間は、各コンテンツごとに定められた期間とします。期間が定められていない場合は、本サービスを提供している期間中利用可能とします。<br />
          （3）本サービスは、コンテンツの適切な利用を確保するため、同時視聴数の制限、利用デバイスの制限等の技術的制限を設けることがあります。<br />
          （4）コンテンツには、著作権保護技術（DRM）が適用される場合があり、会員は当該技術的制限に従って利用するものとします。<br />
          （5）インターネット接続環境やデバイスの性能等により、コンテンツの利用に支障が生じる場合がありますが、当社はこれらについて責任を負いません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第7条（返品・キャンセル・返金）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）法律上、購入後の返品、キャンセル及び返金は一切受け付けません。<br />
          （2）前項にかかわらず、法令により返金が義務付けられている場合には、当社の裁量により、当社が適当と認める方法で返金手続きを行います。返金額及び返金時期については、当社が合理的に判断して決定します。<br />
          （3）返金に際して手数料が発生する場合は、会員ユーザーの負担とします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第8条（環境要件・通信費）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービスの利用には、インターネット接続環境及び当社が推奨するデバイス・ソフトウェア環境が必要です。<br />
          （2）推奨環境については、本サイト上に掲載いたします。推奨環境以外での利用により生じる不具合については、当社は責任を負いません。<br />
          （3）本サービスの利用に必要な通信費、電気代等の費用は、すべてユーザーの負担とします。<br />
          （4）インターネット接続環境の不安定性、通信回線の混雑、機器の不具合等、当社以外の事由による本サービスの中断や利用への支障について、当社は責任を負いません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第9条（禁止行為）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。<br />
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.法令又は公序良俗に違反する行為</li>
            <li style={{ marginBottom: '8px' }}>2.犯罪行為に関連する行為</li>
            <li style={{ marginBottom: '8px' }}>3.コンテンツの複製、転載、再配布、公衆送信等の行為</li>
            <li style={{ marginBottom: '8px' }}>4.コンテンツに施された技術的制限を回避する行為</li>
            <li style={{ marginBottom: '8px' }}>5.リバースエンジニアリング、逆コンパイル、逆アセンブル等の行為</li>
            <li style={{ marginBottom: '8px' }}>6.本サービスのシステムに対する不正アクセス、攻撃等の行為</li>
            <li style={{ marginBottom: '8px' }}>7.虚偽の情報を用いた決済や不正な決済手段を用いた購入</li>
            <li style={{ marginBottom: '8px' }}>8.チャージバック等の不正な返金請求</li>
            <li style={{ marginBottom: '8px' }}>9.他ユーザーの利用を妨害する行為</li>
            <li style={{ marginBottom: '8px' }}>10.当社の設備に過度な負荷をかける行為</li>
            <li style={{ marginBottom: '8px' }}>11.当社又は第三者の知的財産権、肖像権、プライバシー、名誉その他の権利又は利益を侵害する行為</li>
            <li style={{ marginBottom: '8px' }}>12.過度に暴力的な表現、露骨な性的表現、人種、国籍、信条、性別、社会的身分、門地等による差別につながる表現、自殺、自傷行為、薬物乱用を誘引又は助長する表現、その他反社会的な内容を含み他人に不快感を与える行為</li>
            <li style={{ marginBottom: '8px' }}>13.営業、宣伝、広告、勧誘、その他営利を目的とする行為（当社が認めたものを除きます。）</li>
            <li style={{ marginBottom: '8px' }}>14.反社会的勢力等への利益供与その他の協力行為</li>
            <li style={{ marginBottom: '8px' }}>15.その他、当社が不適切と判断する行為</li>
          </ol>
          （2）当社は、ユーザーが前項各号に違反したと判断した場合、事前の通知又は催告なしに、当該ユーザーに対し本サービスの利用停止等の措置を講じることができます。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第10条（知的財産権）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービス及びコンテンツに関する知的財産権は、当社にライセンスを許諾している権利者に帰属します。<br />
          （2）当社は、会員ユーザーに対し、本規約に従った本サービス利用に必要な範囲で、コンテンツの利用を許諾します。<br />
          （3）前項の利用許諾は、非独占的かつ譲渡不可能なものであり、会員ユーザーは第三者に対してこれを再許諾することはできません。<br />
          （4）会員ユーザーは、本規約に定める場合を除き、コンテンツを複製、改変、公衆送信、譲渡、貸与、翻訳、翻案等することはできません。<br />
          （5）本規約終了後は、会員に許諾された利用権は終了し、会員ユーザーは直ちにコンテンツの利用を停止し、保存されたデータを削除するものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第11条（サービスの変更・中断・終了）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社の都合により、本サービス内容を変更又は提供を中断、終了することができるものとします。<br />
          （2）当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部又は一部の提供を停止又は中断することができるものとします。<br />
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.本サービスにかかるコンピュータシステムの保守点検又は更新を行う場合</li>
            <li style={{ marginBottom: '8px' }}>2.地震、落雷、火災、停電、天災、戦争、紛争、動乱、暴動、労働争議等の不可抗力により、本サービス提供が困難となった場合</li>
            <li style={{ marginBottom: '8px' }}>3.コンピュータ又は通信回線等が事故により停止した場合</li>
            <li style={{ marginBottom: '8px' }}>4.その他、当社が本サービス提供が困難と判断した場合</li>
          </ol>
          （3）当社は、本サービス提供の停止、中断、終了、内容の変更により、ユーザー又は第三者が被ったいかなる不利益又は損害についても、一切の責任を負わないものとします。<br />
          （4）本サービス終了に際しては、当社は会員に対して事前に通知するよう努めますが、やむを得ない事情がある場合にはこの限りではありません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第12条（免責・保証否認）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、本サービス又はコンテンツに、システムエラー、バグ等の不具合が一切含まれないことを保証するものではありません。<br />
          （2）当社は、本サービス又はコンテンツが会員ユーザーの特定の目的に適合すること、期待する機能・商品的価値・正確性・有用性を有すること、会員ユーザーによる本サービス利用が会員に適用のある法令又は業界団体の内部規則等に適合すること、及び不具合が生じないことについて、何ら保証するものではありません。<br />
          （3）当社は、本サービス提供の中断、停止、終了、利用不能又は変更、会員ユーザーが本サービスに送信したメッセージ又は情報の削除又は消失、会員の登録の抹消、本サービス利用による機器の故障又は損傷、その他本サービスに関して会員が被った損害につき、賠償する責任を一切負わないものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第13条（利用停止・契約解除）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、会員ユーザーが以下のいずれかに該当する場合には、事前の通知又は催告なしに、当該会員ユーザーについて本サービス利用を停止し、又は会員ユーザーとしての登録を抹消することができるものとします。<br />
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.本規約のいずれかの条項に違反した場合</li>
            <li style={{ marginBottom: '8px' }}>2.登録事項に虚偽の事実があることが判明した場合</li>
            <li style={{ marginBottom: '8px' }}>3.決済手段として登録されたクレジットカード等が利用停止となった場合</li>
            <li style={{ marginBottom: '8px' }}>4.料金等の支払債務の不履行があった場合</li>
            <li style={{ marginBottom: '8px' }}>5.当社からの連絡に対し、180日以上返答がない場合</li>
            <li style={{ marginBottom: '8px' }}>6.本サービスについて、24ヶ月以上利用がない場合</li>
            <li style={{ marginBottom: '8px' }}>7.第14条に定める反社会的勢力等に該当し、又は該当するに至った場合</li>
            <li style={{ marginBottom: '8px' }}>8.その他、当社が本サービス利用を適当でないと判断した場合</li>
          </ol>
          （2）前項各号のいずれかに該当した場合、会員ユーザーは、当社に対する一切の債務について当然に期限の利益を失い、その時点において負担する一切の債務を直ちに一括して弁済しなければなりません。<br />
          （3）当社は、本条に基づき当社が行った行為により会員ユーザーに生じた損害について、一切の責任を負いません。<br />
          （4）本条に基づき会員登録が抹消された場合、当該会員ユーザーは、当社の事前の書面による承諾がない限り、再度の会員登録を行うことはできません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第14条（反社会的勢力の排除）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）会員ユーザーは暴力団、暴力団員、右翼団体、反社会的勢力、その他これに準ずる者（以下「反社会的勢力等」といいます。）ではないこと、及び将来にわたっても該当しないことを確約するものとします。<br />
          （2）会員ユーザーは、反社会的勢力等に対して資金等を提供し、又は便宜を供与する等直接又は間接に反社会的勢力等の維持、運営に協力し、若しくは関与する行為を行わないことを確約するものとします。<br />
          （3）当社は、会員ユーザーが前二項の規定に違反した場合、何らの催告なく直ちに本規約を解除することができるものとし、これにより会員に損害が生じた場合でも、当社は一切の責任を負わないものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第15条（個人情報の取扱い）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、本サービス利用により取得する会員の個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。<br />
          （2）当社のプライバシーポリシーについては、本サイト上に掲載するものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第16条（本サービスで取り扱わないコンテンツ）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本サービスは、以下のコンテンツを取り扱いません。
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.公序良俗に反するもの</li>
            <li style={{ marginBottom: '8px' }}>2.銃刀法、麻薬取締法、薬機法その他法令の定めに違反するもの（違法薬物、無許可医薬品、危険ドラッグ等を含む）</li>
            <li style={{ marginBottom: '8px' }}>3.第三者の著作権、肖像権、知的財産権等を侵害するおそれのあるもの</li>
            <li style={{ marginBottom: '8px' }}>4.児童ポルノ、未成年者を対象とする性表現、同意のない性行為、獣姦その他の非合法又は不適切な性表現に関するもの</li>
            <li style={{ marginBottom: '8px' }}>5.過度な暴力表現、死体損壊その他残虐な行為を描写するもの</li>
            <li style={{ marginBottom: '8px' }}>6.嘔吐物、糞尿等の汚物を過剰に描写するもの</li>
            <li style={{ marginBottom: '8px' }}>7.権利処理されていない楽曲その他著作物</li>
            <li style={{ marginBottom: '8px' }}>8.盗品その他不法に取得されたもの</li>
            <li style={{ marginBottom: '8px' }}>9.商品の販売（デジタルコンテンツを除く）</li>
            <li style={{ marginBottom: '8px' }}>10.その他、当社が不適切と判断したもの</li>
          </ol>
          （2）以下に該当する表現について、法令上または当社基準に照らして適切な修正（モザイク等）が施されていないコンテンツは提供しません。
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.性器、性器を連想させる部位</li>
            <li style={{ marginBottom: '8px' }}>2.性器又はアヌス結合部位及び挿入部位（異物を含む）</li>
            <li style={{ marginBottom: '8px' }}>3.嘔吐物、糞尿等の汚物</li>
            <li style={{ marginBottom: '8px' }}>4.生体、死体、動物等を損壊させる状態を詳細又は過剰に表現するもの</li>
            <li style={{ marginBottom: '8px' }}>5.その他、大多数のユーザーが不愉快と感じる可能性があると当社が判断するもの</li>
          </ol>
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第17条（規約の変更）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は以下の場合には、会員ユーザーの個別の同意を要せず、本規約を変更することができるものとします。<br />
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1.本規約の変更が会員ユーザーの一般の利益に適合するとき</li>
            <li style={{ marginBottom: '8px' }}>2.本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
          </ol>
          （2）当社は前項による本規約の変更にあたっては、事前に、本規約を変更する旨及び変更後の本規約の内容並びに効力発生時期を、本サイト上への掲載その他の適切な方法により周知又は通知します。<br />
          （3）前項の通知後、会員ユーザーが本サービスを継続して利用した場合、変更後の本規約に同意したものとみなします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第18条（通知・連絡）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社と会員ユーザーとの間の通知又は連絡は、当社の定める方法によって行うものとします。<br />
          （2）当社が登録された連絡先（メールアドレス等）に通知又は連絡をした場合、会員ユーザーがそれを受信したか否かを問わず、通常到達すべき時に到達したものとみなします。<br />
          （3）当社は、本サービス上での掲示により会員ユーザーに対する通知又は連絡に代えることができるものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第19条（譲渡禁止）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）会員ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位又は本規約に基づく権利もしくは義務を第三者に譲渡し、又は担保に供することはできません。<br />
          （2）当社は本サービスにかかる事業を他社に譲渡した場合には、当該事業譲渡に伴い利用契約上の地位、本規約に基づく権利及び義務並びに会員の登録情報その他の顧客情報を当該事業譲渡の譲受人に譲渡することができるものとし、会員ユーザーは、かかる譲渡につき本項において予め同意したものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第20条（分離可能性）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本規約のいずれかの条項又はその一部が無効又は執行不能と判断された場合であっても、そのことは他の規定の有効性に影響を与えないものとします。<br />
          （2）無効又は執行不能と判断された条項又はその一部についても、法律上可能な限り、当初の条項の趣旨に沿うよう解釈されるものとします。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第21条（企業ポリシー）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社は、コンテンツの出演者および視聴者の人権を守ります。<br />
          （2）当社は、児童ポルノ（Child Sexual Abuse Material（CSAM)）、近親相姦、獣姦、同意のない性的行為、体の切断、人身売買、性売買、または虐待を促進または助長するようなコンテンツは取り扱いいたしません。<br />
          （3）当社は、18歳未満（未成年者）ならびに出演者の同意のないコンテンツは販売しません。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第22条（苦情ポリシー）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）当社はすべての苦情を真摯に受け止め、迅速、公正かつ効果的に苦情を解決することを目指します。当社は関係者の苦情に丁寧に対応することをお約束します。<br />
          （2）苦情の受領後内容を精査し、当社の判断において速やかに対応できると思われることは可能な限り速やかに対応します。<br />
          （3）苦情の内容により協議が必要と認められる場合は、協議の機会を設けた上で対応します。<br />
          （4）苦情の内容に関連して、関係者の懸念を十分に調査するために、関係者からさらなる情報を求める場合があります。<br />
          （5）苦情に対して速やかに解決策を提示できない場合、以後の対応に予想されるスケジュールを示し最新情報を提供するよう努めます。<br />
          （6）すべての苦情は記録されます。これは苦情を分析して実際に何が起こったのか、あるいは問題から何が起こった可能性があるのかを判断できるようにするためです。苦情対応に関する取り組みの内容は、継続的に見直すとともに、必要に応じた改善を行います。<br />
          （7）当社は、消費者、児童保護や人権保護団体（個人、法人および国内、海外を問わない）を含む第三者からコンテンツに対して弊社ポリシーに反する可能性があると指摘を受けたときは、速やかに調査を行います。調査の結果、ポリシーに反するコンテンツに該当すると弊社もしくは関連機関が判断した場合、直ちに対象コンテンツの削除を行います。<br />
          （8）当社は、コンテンツの出演者から出演の同意をしていない、もしくはコンテンツの頒布の同意をしていないと主張を受けたときは、該当のコンテンツは同意の状況を確認できるまで、閲覧、購入ができないように措置を講じます。なお、同意が確認できなかった場合、または、コンテンツの出演者が、適用される法律の下で同意が無効であることを証明できる場合、直ちにコンテンツを削除いたします。<br /><br />
          苦情連絡先は以下のとおりとなります。<br />
          郵送：〒150-0043　東京都渋谷区道玄坂1-12-1 渋谷マークシティW22階<br />
          電話番号：03-6840-1624<br />
          メール：support@mijfans.jp
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第23条（退会について）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）ユーザーは、当社所定の手続により、いつでも自由に本サービスから退会することができます。<br />
          （2）退会にあたり、ユーザーに手数料その他の費用は一切発生しません。<br />
          （3）ユーザーは、当社が指定するお問い合わせ用メールアドレス（support@mijfans.jp）宛に退会の旨を連絡することで、当社の承諾を要することなく退会手続きを完了することができます。<br />
          （4）当社は、ユーザーからの退会連絡を確認後、速やかに登録情報の削除を行い、退会完了の旨を通知します。<br />
          （5）退会手続完了後、ユーザーの登録情報および関連データは、当社のプライバシーポリシー（第9条）に従い、適切に削除または処理されます。
        </div>

        <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 15px 0' }}>
          第24条（準拠法・管轄裁判所）
        </div>
        <div className="content" style={{ marginBottom: '20px' }}>
          （1）本規約及び本契約の準拠法は日本法とします。<br />
          （2）ユーザー及び当社は、本契約に関して訴訟の必要が生じた場合、訴額に応じて東京簡易裁判所又は東京地方裁判所を第一審の専属的管轄裁判所とすることに合意するものとします。
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <div className="article-title" style={{ fontWeight: 'bold', fontSize: '18px' }}>附則</div>
          <div className="content">
            本規約は2025年8月14日から適用されます。<br />
            制定: 2025年8月14日
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
