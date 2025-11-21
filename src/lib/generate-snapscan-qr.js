import QRCodeStyling from "qr-code-styling";

export function generateSnapScanQR(elementId) {
  const qr = new QRCodeStyling({
    width: 600,
    height: 600,
    type: "svg",     // crisp & scalable
    data: "https://pos.snapscan.io/qr/VISFNLkM",
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: "dots",    // rounded organic blobs
      color: "#000000" // black inner modules
    },
    cornersSquareOptions: {
      type: "extra-rounded", // soft blob finders
      color: "#B3282D"       // brand red
    },
    cornersDotOptions: {
      type: "dot",
      color: "#B3282D"
    },
    backgroundOptions: {
      color: "#FFFFFF"
    }
  });

  qr.append(document.getElementById(elementId));
}
