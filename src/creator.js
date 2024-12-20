const JSPDF_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const ERR_MSG = "Error occured";
const USER_ERR_MSG = "Creating PDF failed";
const PDF_NAME = "website.pdf";

let AREA = document.body;

const DIV_NAME = "container";
const MODE_URL = "https://example.com"; // URL of the specialised mode, TBA

const run = () => {
  if (general()) {
    window.addEventListener("keydown", (e) => {
      if (e.key === "PageDown") {
        init();
      }
    });
  }
};

const general = () => {
  return window.location.href.startsWith(MODE_URL) ? false : true;
};

const init = () => {
  AREA = general() ? AREA : document.getElementById(DIV_NAME);
  load();
};

const load = async () => {
  try {
    await dependencies(JSPDF_URL);
    await dependencies(HTML2CANVAS_URL);
    await create();
  } catch (error) {
    err();
    return;
  }
};

const dependencies = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      setTimeout(() => {
        if (src === JSPDF_URL && (!window.jspdf || !window.jspdf.jsPDF)) {
          reject("jspdf not loaded");
        } else if (
          src === HTML2CANVAS_URL &&
          typeof window.html2canvas === "undefined"
        ) {
          reject("html2canvas not loaded");
        } else {
          resolve();
        }
      }, 100);
    };
    script.onerror = () => reject("Error loading script");
    document.head.appendChild(script);
  });
};

const create = async () => {
  helper(); // opens all accordion headers if mode is not general
  if (!window.jspdf || !window.jspdf.jsPDF) {
    err();
    return;
  }
  const { jsPDF } = window.jspdf;
  if (typeof html2canvas === "undefined") {
    err();
    return;
  }
  const pdf = new jsPDF();
  const canvas = await html2canvas(AREA);
  if (!canvas || !canvas.width || !canvas.height) {
    err();
    return;
  }
  const imgData = canvas.toDataURL("image/png");
  if (!imgData) {
    err();
    return;
  }
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  if (isNaN(pdfWidth) || isNaN(pdfHeight) || pdfHeight <= 0) {
    err();
    return;
  }
  pdf.internal.pageSize.setHeight(pdfHeight);
  try {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  } catch (error) {
    err();
    return;
  }
  pdf.save(PDF_NAME);
  helper(); // closes all accordion headers if mode is not general
};

const err = () => {
  console.error(ERR_MSG);
  alert(USER_ERR_MSG);
};

const helper = () => {
  if (general()) {
    return;
  }
  const hdr = "ui-accordion-header";
  const hdrActive = "ui-accordion-header-active";
  Array.from(document.querySelectorAll("*"))
    .filter((el) => el.id && el.classList.contains(hdr))
    .forEach((el) => {
      if (!el.classList.contains(hdrActive)) {
        el.classList.add(hdrActive);
        el.nextElementSibling.style.display = "block";
      } else {
        for (let i = 0; i < 2; i++) {
          el.click();
        }
      }
    });
};
