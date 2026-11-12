// This is the local Vant default material illustration from assets/empty/empty.svg.
// Keeping the XML in the source lets SvgXml render the same offline asset on RN and Web
// without requiring an SVG Metro transformer in library consumers.
export const VANT_EMPTY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="building" x1="64%" y1="100%" x2="64%" y2="0%">
      <stop offset="0%" stop-color="#FFF" stop-opacity=".5" />
      <stop offset="100%" stop-color="#F2F3F5" />
    </linearGradient>
    <linearGradient id="cloud" x1="64%" y1="97%" x2="64%" y2="0%">
      <stop offset="0%" stop-color="#F2F3F5" stop-opacity=".3" />
      <stop offset="100%" stop-color="#F2F3F5" />
    </linearGradient>
    <linearGradient id="device" x1="50%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#F2F3F5" />
      <stop offset="100%" stop-color="#DCDEE0" />
    </linearGradient>
    <linearGradient id="device-side" x1="95%" y1="48%" x2="5.5%" y2="51%">
      <stop offset="0%" stop-color="#EAEDF1" />
      <stop offset="100%" stop-color="#DCDEE0" />
    </linearGradient>
    <linearGradient id="base" y1="45%" x2="100%" y2="54%">
      <stop offset="0%" stop-color="#EAEDF1" />
      <stop offset="100%" stop-color="#DCDEE0" />
    </linearGradient>
  </defs>
  <g opacity=".8">
    <path d="M36 131V53H16v20H2v58h34z" fill="url(#building)" />
    <path d="M123 15h22v14h9v77h-31V15z" fill="url(#building)" />
  </g>
  <g opacity=".8">
    <path d="M87 6c3 0 7 3 8 6a8 8 0 1 1-1 16H80a7 7 0 0 1-8-6c0-4 3-7 6-7 0-5 4-9 9-9Z" fill="url(#cloud)" />
    <path d="M19 23c2 0 3 1 4 3 2 0 4 2 4 4a4 4 0 0 1-4 3v1h-7v-1l-1 1c-2 0-3-2-3-4 0-1 1-3 3-3 0-2 2-4 4-4Z" fill="url(#cloud)" />
  </g>
  <g transform="translate(36 50)" fill="none">
    <g transform="translate(8)">
      <rect fill="#EBEDF0" opacity=".6" x="38" y="13" width="36" height="53" rx="2" />
      <rect fill="url(#device)" width="64" height="66" rx="2" />
      <rect fill="#FFF" x="6" y="6" width="52" height="55" rx="1" />
      <g transform="translate(15 17)" fill="url(#device-side)">
        <rect width="34" height="6" rx="1" />
        <path d="M0 14h34v6H0z" />
        <rect y="28" width="34" height="6" rx="1" />
      </g>
    </g>
    <rect fill="url(#base)" y="61" width="88" height="28" rx="1" />
    <rect fill="#F7F8FA" x="29" y="72" width="30" height="6" rx="1" />
  </g>
</svg>`
