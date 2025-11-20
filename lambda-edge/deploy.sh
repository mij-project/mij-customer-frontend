#!/bin/bash

###############################################################################
# Lambda@Edge OGPハンドラー デプロイスクリプト
#
# 使い方:
#   ./deploy.sh <環境> [バージョン説明]
#
# 例:
#   ./deploy.sh staging "動的OGP対応 v1.0"
#   ./deploy.sh production "OGP画像サイズ修正 v1.1"
#
# 環境:
#   staging     - ステージング環境
#   production  - 本番環境
###############################################################################

set -e  # エラーが発生したら即座に終了

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -lt 1 ]; then
  echo -e "${RED}エラー: 環境を指定してください${NC}"
  echo "使い方: $0 <環境> [バージョン説明]"
  echo "環境: staging | production"
  exit 1
fi

ENVIRONMENT=$1
VERSION_DESC=${2:-"デプロイ $(date '+%Y-%m-%d %H:%M:%S')"}

# 環境に応じた設定
if [ "$ENVIRONMENT" == "staging" ]; then
  FUNCTION_NAME="stg-mijfans-ogp-handler"
  API_BASE_URL="https://stg-api.mijfans.jp"
  SITE_BASE_URL="https://stg.mijfans.jp"
elif [ "$ENVIRONMENT" == "production" ]; then
  FUNCTION_NAME="prd-mijfans-ogp-handler"
  API_BASE_URL="https://api.mijfans.jp"
  SITE_BASE_URL="https://mijfans.jp"
else
  echo -e "${RED}エラー: 無効な環境: $ENVIRONMENT${NC}"
  echo "有効な環境: staging | production"
  exit 1
fi

AWS_REGION="us-east-1"  # Lambda@Edgeは必ずus-east-1

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}Lambda@Edge OGPハンドラー デプロイ${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "環境: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Lambda関数名: ${GREEN}$FUNCTION_NAME${NC}"
echo -e "リージョン: ${GREEN}$AWS_REGION${NC}"
echo -e "バージョン説明: ${GREEN}$VERSION_DESC${NC}"
echo ""

# 確認プロンプト
read -p "デプロイを続行しますか？ (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}デプロイをキャンセルしました${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}Step 1: Lambda関数コードをZIP圧縮${NC}"
echo "--------------------------------------"

# 一時ディレクトリを作成
BUILD_DIR=$(mktemp -d)
echo -e "一時ディレクトリ: ${GREEN}$BUILD_DIR${NC}"

# ソースファイルをコピー
cp ogp-handler.mjs "$BUILD_DIR/"

# ZIPファイルを作成
cd "$BUILD_DIR"
zip -q ogp-handler.zip ogp-handler.mjs
cd - > /dev/null

echo -e "${GREEN}✓ ZIP圧縮完了${NC}"
echo ""

echo -e "${BLUE}Step 2: Lambda関数を更新${NC}"
echo "--------------------------------------"

# Lambda関数が存在するか確認
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
  echo -e "Lambda関数 ${GREEN}$FUNCTION_NAME${NC} を更新します"

  # コードを更新
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$BUILD_DIR/ogp-handler.zip" \
    --region "$AWS_REGION" \
    > /dev/null

  echo -e "${GREEN}✓ コード更新完了${NC}"

  # Lambda@Edgeは環境変数を使用できないため、環境変数の設定をスキップ
  echo -e "${YELLOW}注: Lambda@Edgeは環境変数を使用できません。環境判定はDistribution IDで自動的に行われます。${NC}"

else
  echo -e "${YELLOW}Lambda関数が存在しないため、新規作成します${NC}"

  # IAMロールARNを取得（既存のロールを使用する場合）
  # または新しいロールを作成する必要があります
  echo -e "${RED}エラー: Lambda関数が存在しません${NC}"
  echo "AWSコンソールで手動作成するか、AWS CLIで以下のコマンドを実行してください:"
  echo ""
  echo "aws lambda create-function \\"
  echo "  --function-name $FUNCTION_NAME \\"
  echo "  --runtime nodejs20.x \\"
  echo "  --role arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME> \\"
  echo "  --handler ogp-handler.handler \\"
  echo "  --zip-file fileb://$BUILD_DIR/ogp-handler.zip \\"
  echo "  --timeout 30 \\"
  echo "  --memory-size 256 \\"
  echo "  --region $AWS_REGION"
  echo ""
  exit 1
fi

echo ""

echo -e "${BLUE}Step 3: Lambda関数が更新されるまで待機${NC}"
echo "--------------------------------------"
sleep 5
echo -e "${GREEN}✓ 待機完了${NC}"
echo ""

echo -e "${BLUE}Step 4: 新しいバージョンを発行${NC}"
echo "--------------------------------------"

VERSION_OUTPUT=$(aws lambda publish-version \
  --function-name "$FUNCTION_NAME" \
  --description "$VERSION_DESC" \
  --region "$AWS_REGION")

VERSION_NUMBER=$(echo "$VERSION_OUTPUT" | grep -o '"Version": "[^"]*"' | cut -d'"' -f4)
FUNCTION_ARN=$(echo "$VERSION_OUTPUT" | grep -o '"FunctionArn": "[^"]*"' | cut -d'"' -f4)

echo -e "発行されたバージョン: ${GREEN}$VERSION_NUMBER${NC}"
echo -e "Lambda ARN: ${GREEN}$FUNCTION_ARN${NC}"
echo ""

echo -e "${GREEN}✓ バージョン発行完了${NC}"
echo ""

# 一時ファイルを削除
rm -rf "$BUILD_DIR"

echo -e "${BLUE}===========================================${NC}"
echo -e "${GREEN}デプロイ完了！${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""
echo -e "${YELLOW}次のステップ:${NC}"
echo "1. CloudFrontディストリビューションを開く"
echo "2. Behaviors タブでデフォルトビヘイビアを編集"
echo "3. Function associations セクションで以下を設定:"
echo ""
echo -e "   ${GREEN}CloudFront event:${NC} Origin request"
echo -e "   ${GREEN}Lambda function ARN:${NC} $FUNCTION_ARN"
echo ""
echo "4. 変更を保存し、CloudFrontのデプロイ完了を待つ（5〜15分）"
echo ""
echo -e "${BLUE}===========================================${NC}"
