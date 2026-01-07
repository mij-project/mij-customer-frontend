import React from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import SEOHead from '@/components/seo/SEOHead';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';

export default function LegalNotice() {
  const navigate = useNavigate();
  return (
    <>
      <SEOHead
        title="特定商取引法に基づく表記"
        description="mijfansの特定商取引法に基づく表記。販売業者、運営責任者、所在地などの情報を記載しています。"
        canonical="https://mijfans.jp/legal-notice"
        keywords="特定商取引法,運営会社,mijfans,会社情報"
        type="website"
        noIndex={false}
        noFollow={false}
      />
      {/* <Header /> */}
      <AccountHeader title="" showBackButton={true} onBack={() => navigate(-1)} />
      <div
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
          backgroundColor: '#ffffff',
          color: '#333333',
          lineHeight: 1.6,
          margin: 0,
          padding: '40px 20px',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: '100px',
          paddingBottom: '100px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#000000',
          }}
        >
          特定商取引法に基づく表記
        </h1>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            事業者名
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            Linkle株式会社
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            運営責任者
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            倉石楽生
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            所在地
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            東京都豊島区西池袋2-36-1ソフトタウン池袋913号
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            電話番号
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            <div style={{ marginBottom: '4px' }}>03-6820-5817</div>
            <div
              style={{
                fontSize: '14px',
                color: '#666666',
                marginTop: '4px',
              }}
            >
              ※電話でのお問い合わせは受け付けておりません。お問い合わせは下記よりお願いいたします。
            </div>
            <div style={{ marginBottom: '4px', marginTop: '8px' }}>support@mijfans.jp</div>
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            販売価格
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            各商品ページの価格に準じます。
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            商品以外の必要料金
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            価格表示はすべて消費税込みです
            <br />
            決済時に、システム利用料として商品代金の10％が加算されます
            <br />
            銀行振込をご利用の場合、振込手数料は別途ご負担となります
            <br />
            プロバイダ料金および通信回線費用は別途ご負担となります
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            お支払い方法
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            クレジットカード(JCB)
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            お支払期限
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            ご注文時にお支払い確定
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            商品の引き渡し時期
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            お支払い完了後、サービスの提供を行います。
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            返品・キャンセル
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            サービスの性質上、契約締結後のキャンセル、クーリングオフは一切認められず、お支払い頂いた料金については理由を問わず返還いたしません。
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            サービスの解約条件
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            解約される場合は、当社サイト上の記載に従って解約手続を行う必要があります。
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            paddingBottom: '30px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            その他費用
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            当社が代理受領した料金を「クリエイター」が指定する振込先口座に振り込む際、振込手数料として330円（税込）を当社にお支払いいただきます。
            <br />
            <br />
            なお、ご指定いただいた振込先口座情報の不備・誤記によって誤った振込先への振込がなされてしまった場合に、当社が任意で行う組戻し手続に際し、組戻し手数料として880円（税込）を当社にお支払いいただきます。
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            映像送信型性風俗特殊営業届
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            茨城県公安委員会
            <br />
            第1160611号
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
