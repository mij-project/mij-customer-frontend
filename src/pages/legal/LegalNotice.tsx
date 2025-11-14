import React from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';

export default function LegalNotice() {
  return (
    <>
      <Header />
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
            販売業者
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
            代表取締役
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
            運営責任者
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
            所在地
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            東京都渋谷区道玄坂1-12-1 渋谷マークシティW22階
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
            <div style={{ marginBottom: '4px' }}>03-6840-1624</div>
            <div
              style={{
                fontSize: '14px',
                color: '#666666',
                marginTop: '4px',
              }}
            >
              ※電話でのお問い合わせは受け付けておりません。お問い合わせは下記よりお願いいたします
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
            各商品ページの価格に準じます
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
            クレジットカード・銀行振込・BitCash
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
            代金支払時期
          </div>
          <div
            style={{
              fontSize: '16px',
              marginLeft: 0,
            }}
          >
            前払いのみ
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
            お支払い完了後、即時
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
            法律上、返品・キャンセルは一切お受けできません
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
