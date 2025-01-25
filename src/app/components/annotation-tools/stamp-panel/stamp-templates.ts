import { StampData } from "./StampData";

export const STAMP_TEMPLATES: StampData[] = [
      {
        id: 1,
        name: "APPROVED",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
            <defs>
              <linearGradient id="Gradient">
                <stop stop-color="#f2f7ec" offset="0%" />
                <stop stop-color="#d6e4cf" offset="100%" />
              </linearGradient>
            </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#698753" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#698753"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >APPROVED</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 2,
        name: "NOT APPROVED",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#fecfcf" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#910f05" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#910f05"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >NOT APPROVED</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 3,
        name: "DRAFT",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d2d6e7" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#182564" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#182564"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >DRAFT</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 4,
        name: "FINAL",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d7e5d0" offset="100%" />
                </linearGradient>
              </defs>  
              <rect width="224" height="52" rx="8" ry="8" stroke="#416a1c" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#416a1c"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >FINAL</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 5,
        name: "COMPLETED",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d7e5d0" offset="100%" />
                </linearGradient>
              </defs>  
              <rect width="224" height="52" rx="8" ry="8" stroke="#416a1c" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#416a1c"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >COMPLETED</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 6,
        name: "CONFIDENTIAL",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>    
              <rect width="224" height="52" rx="8" ry="8" stroke="#182564" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#182564"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >CONFIDENTIAL</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 7,
        name: "FOR PUBLIC RELEASE",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>    
              <rect width="224" height="52" rx="8" ry="8" stroke="#698753" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#698753"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >FOR PUBLIC RELEASE</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 8,
        name: "NOT FOR PUBLIC RELEASE",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#1e2a67" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#1e2a67"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >NOT FOR PUBLIC RELEASE</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 9,
        name: "FOR COMMENT",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#182564" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#182564"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >FOR COMMENT</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 10,
        name: "VOID",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#fdd0d0" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#910f05" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#910f05"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >VOID</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 11,
        name: "PRELIMINARY RESULTS",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#182564" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#182564"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >PRELIMINARY RESULTS</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
      {
        id: 12,
        name: "INFORMATION ONLY",
        src: window.URL.createObjectURL(new Blob([`
            <svg xmlns="http://www.w3.org/2000/svg" width="224" height="52" viewBox="0 0 224 52" fill="none">
              <defs>
                <linearGradient id="Gradient">
                  <stop stop-color="#f2f7ec" offset="0%" />
                  <stop stop-color="#d1d6e7" offset="100%" />
                </linearGradient>
              </defs>
              <rect width="224" height="52" rx="8" ry="8" stroke="#182564" stroke-width="1" fill="url(#Gradient)"/>
              <text x="112" y="38" font-family="Arial" 
              font-size="36" text-anchor="middle" fill="#182564"
              font-weight="bolder"
              textLength="200"
              lengthAdjust="spacingAndGlyphs"
              >INFORMATION ONLY</text>
            </svg>
        `],{type: 'image/svg+xml'})),
        type: 'image/svg+xml',
        height: 52,
        width: 224
      },
  ];