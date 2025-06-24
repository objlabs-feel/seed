This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Project Structure
repository = github + turborepo
base framework = Next.JS
src = app/*

C(CREATE): POST 
R(READ): GET
U(UPDATE): PUT
D(DELETE): DELETE 

해당 프로젝트는 신개념 프로젝트로,
관리자의 기능은 전통적인 방식의 개발을 진행한다.
이용자 기능의 경우 회원가입이 없이 클라이언트에서 제공하는 device_token(UUID)을 이용하여 이용자의 체크인, 체크아웃, 이용자정보 영구삭제 기능을 제공하게 된다.
이용자는 체크인 후 각 기능들을 사용하면서 필요시 요청되는 개인정보를 입력하게 되며, 개인정보 삭제요청(이용자정보 영구삭제)시 개인정보의 영역인 모두 빈값으로 변경되어 이력확인이 불가능하다.
따라서, 이용자는 자유롭게 체크인하여 서비스를 이용하고, 언제든지 체크아웃 할 수 있으며, 개인정보 삭제요청하여 이용자의 개인정보를 보호받을 수 있다.

관리자( 경로 : /app/admin )
/app/admin : 관리자 전용 페이지
/app/admin/api : 관리자 전용 api
특징 : username & password로 로그인하고, 관리자 페이지 접근하여 서버 데이터의 관리 및 서비스 관리가 가능하다.
> admin 페이지에서 사용가능한 api는 별도로 구성하여 일반 이용자가 접근 불가능하도록 관리한다
> admin관련 페이지 및 api 코드는 ./app/admin 디렉토리에서 관리한다

이용자( 경로 : /app )
/app : 전체 이용자 페이지
/app/api : 이용자용 api
특징 : 해당 서비스는 이용자 관리는 하지만, 회원가입이 없다. 이용자는 체크인, 체크아웃 으로 구분하며, 이때 클라이언트에서 전송하는 device_token를 이용하여 장치를 구분한다.
> user : checkin, checkout, verify로 구성되고, 탈퇴시 profile_id를 추적하여, 관련된 데이터의 개인정보를 빈값으로 처리한다.
> client관련 api 코드는 ./app/api 디렉토리에서 관리한다.
> auth : checkin, checkout, verify
> saleitems : CRUD, search, count
>> auctions : CRUD, search, count, bid, decision, complete, history 
> users : RUD(C제외), cart, saleitems, viewhistory 
> device-types : R
> manufacturers : R
> companies : R
> constants : R
> notifications : CRUD, list, broadcast, read_chk

테스트( 경로 : /app/test )
/app/test : 개발시 테스트 전용 페이지

특징 : 개발된 api를 테스트 할 수 있는 페이지를 관리한다. 해당 페이지는 .env 파일에 기록된 정보를 이용하여 접근 가능여부를 확인한다.
TEST_ENABLE="Y" 빌드시 테스트 페이지 포함, "N" 빌드시 테스트 페이지 미포함
> admin api 테스트
> client api 테스트

PLAN
1) api는 용도별로 분리하여 작성 ( 관리자용, 이용자용 )
2) 작성된 api는 반드시 테스트 페이지에서 테스트 할 수있도록 페이지를 생성하거나, 기존 기능에 추가한다
3) 작성된 api는 테스트를 위해 테스트 데이터 폼 작성 및 api 연결을 해야한다.

# 프롬프트 AI가 개발 서포트 할때의 유의사항
1. 이미 만들어져 있는 코드를 최대한 활용
2. 오류가 있는 코드는 오류 수정
3. 필요한 기능 추가시에는 작업계획을 확인하고 추가 진행
4. 함수형 개발을 위한 구조가 우선이지만, 가독성과 재사용성을 생각해야할 부분에서는 일부 무시할 수 있고, 무시하게 될때는 작업계획을 확인하고 진행
5. 공통 컴포넌트는 @repo/ui 프로젝트에 작업, 비즈니스 로직이나 데이터 모델 변경은 @repo/shared에 작업

AI가 해도 되는 행위 : 신규 파일 추가, 신규 데이터 추가 및 함수 추가
AI가 하면 안되는 행위 : prisma 데이터 모델 스키마의 임의 변경, 파일삭제 > 변경이 필요한때는 항상 변경적용할 내용의 진행여부를 물어보고 진행

데이터 모델의 스키마(변경불가) -> 필요시 변경 요청 / 적용할 내용 확인 요청
/Users/feel/workgroup/objlabs/projects/seed/packages/shared/prisma/schema.prisma
/Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/transformers
/Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/types
/Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/services
