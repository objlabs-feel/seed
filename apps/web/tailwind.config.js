/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // app 디렉토리
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // components 디렉토리 (필요한 경우)
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // src 디렉토리 추가
  ],
  darkMode: 'media', // 다크 모드 활성화 (OS 설정 기반)
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Monaco', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

