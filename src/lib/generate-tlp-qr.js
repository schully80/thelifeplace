import QRCodeStyling from "qr-code-styling";

export function generateTLPQR(elementId) {
  const qr = new QRCodeStyling({
    width: 600,
    height: 600,
    type: "png",
    data: "https://schulteretyang.substack.com",
    qrOptions: {
      errorCorrectionLevel: "H",
      mode: "Byte"
    },
    dotsOptions: {
      type: "dots",        // rounded circles
      color: "#000000"     // black inner modules
    },
    cornersSquareOptions: {
      type: "extra-rounded", // organic rounded finders
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
