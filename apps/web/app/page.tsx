'use client';

import React, { useState, useEffect } from 'react';
import { Link, Element } from 'react-scroll';
import Image from 'next/image';
import './BusinessCard.css';

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  
  const images = [
    '/main_slider_001.webp',
    '/main_slider_002.webp',
    '/main_slider_003.webp'
  ];
  
  const screenshots = [
    '/main_screenshot_001.webp',
    '/main_screenshot_002.webp',
    '/main_screenshot_003.webp',
    '/main_screenshot_004.webp'
  ];

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    const screenshotTimer = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 4000);  // 약간 다른 타이밍으로 전환

    return () => {
      clearInterval(sliderTimer);
      clearInterval(screenshotTimer);
    };
  }, []);

  return (
    <div className="business-card">
      <header className="header">
        <nav className="nav">
          <Link to="company-intro" smooth={true} duration={500}>기업소개</Link>
          <Link to="app-intro" smooth={true} duration={500}>앱 소개</Link>
          <Link to="product-search" smooth={true} duration={500}>상품검색</Link>
        </nav>
      </header>

      <main className="content">
        <Element name="company-intro" className="section">
          <div className="slider">
            <Image
              src={images[currentImage]}
              alt={`Slide ${currentImage + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={currentImage === 0}
            />
          </div>
          <div className="company-intro-text">
            <h2>안녕하세요. <span className="highlight">메디딜러</span>입니다.</h2>
            <p>메디딜러는 고객님들의 모든 의료기기를 온라인으로 <span className="highlight">검사, 관리, 교체, 판매중개</span> 등을 위해 제공되는 플랫폼 회사입니다.</p>
            <p>우리는 늘어나는 <span className="highlight">ESG</span>에 대한 요구에 부응하고자, 기존에 10년넘게 유지하던 의료기 판매 중개사업을 더 폭넓고 고객만족을 위해 제공하고자 마음먹었습니다.</p>
            <p>늘어나는 의료기 유지비용 지출과 복잡한 거래절차, 그리고 투명하게 전달되지 않은 유통마진 구조로인해 고통받아본 경험이 있으실 겁니다. 우리는 이런 문제를 해결하고, 나아가 지속적인 의료 시스템의 노후화에 함께 대비해 나가는 <span className="highlight">파트너</span>가 되고자 합니다.</p>
            <p>앞으로 여러 고객분들과 함께 만들어갈 <span className="highlight">의료기 종합 관리 플랫폼</span>의 모습으로 발전할 수 있도록 응원 부탁드립니다.</p>
            <p className="signature">감사합니다.</p>
          </div>
        </Element>

        <Element name="app-intro" className="section">
          <div className="screenshot-slider">
            <Image
              src={screenshots[currentScreenshot]}
              alt={`Screenshot ${currentScreenshot + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={currentScreenshot === 0}
            />
            <div className="app-links">
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="google-play">
                <Image
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={162}
                  height={48}
                />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="app-store">
                <Image
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={162}
                  height={48}
                />
              </a>
            </div>
          </div>
        </Element>

        <Element name="product-search" className="section">
          <p>상품 검색 영역 (커스텀 내용 추가)</p>
        </Element>
      </main>
    </div>
  );
};

export default Home;
