'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    daum: any;
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export default function Postcode() {
  useEffect(() => {
    if (document.getElementById('daum_postcode_script')) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            zonecode: data.zonecode,
            roadAddress: data.roadAddress,
            jibunAddress: data.jibunAddress
          }));
        }
      }).open();
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.id = 'daum_postcode_script';

    script.onload = () => {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            zonecode: data.zonecode,
            roadAddress: data.roadAddress,
            jibunAddress: data.jibunAddress
          }));
        }
      }).open();
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
