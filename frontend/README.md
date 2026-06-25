This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 개발 환경 (Node 버전)

이 프로젝트는 **Node.js 24 LTS** 를 사용합니다. 버전은 다음 두 곳에 고정돼 있습니다.

- `.nvmrc` → `24` (버전 매니저가 읽는 파일)
- `package.json` → `engines` / `devEngines` (`>=24.0.0 <25.0.0`)

> 홀수 버전(예: 25)은 지원 기간이 짧아 사용하지 않습니다. Node 26·27이 정식 릴리스되면 `.nvmrc`와 `engines` 숫자만 올리면 됩니다.

### 버전 매니저로 맞추기 (fnm 예시)

이 폴더(`frontend/`)에서 작업을 시작할 때 한 번 실행하세요.

```bash
fnm use            # .nvmrc 의 24 적용 (미설치 시: fnm install)
node -v            # v24.x 확인
```

`cd` 할 때 자동으로 전환되게 하려면 셸 설정에 아래 한 줄을 추가합니다.

```powershell
# PowerShell ($PROFILE)
fnm env --use-on-cd | Out-String | Invoke-Expression
```

```bash
# bash/zsh (~/.bashrc, ~/.zshrc)
eval "$(fnm env --use-on-cd)"
```

> nvm 사용자는 `nvm use`, mise 사용자는 `mise use node@24` 로 동일하게 맞출 수 있습니다.
> nvm/fnm/mise 모두 `.nvmrc` 를 읽습니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
