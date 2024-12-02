const JSPDF_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const ERR_MSG = "Error occured";
const USER_ERR_MSG = "Creating PDF failed";
const PDF_NAME = "website.pdf";

let AREA = document.body;

const DIV_NAME = "container";
const MODE_URL = "https://objack.dlouhy.at";

run();

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
    create();
  } catch (error) {
    error();
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
          reject(ERR_MSG);
        } else if (
          src === HTML2CANVAS_URL &&
          typeof window.html2canvas === "undefined"
        ) {
          reject(ERR_MSG);
        } else {
          resolve();
        }
      }, 100);
    };
    script.onerror = () => reject(ERR_MSG);
    document.head.appendChild(script);
  });
};

const create = async () => {
  helper(); // opens all accordion headers if mode is not general
  if (!window.jspdf || !window.jspdf.jsPDF) {
    error();
    return;
  }
  const { jsPDF } = window.jspdf;
  if (typeof html2canvas === "undefined") {
    error();
    return;
  }
  const pdf = new jsPDF();
  const canvas = await html2canvas(AREA);
  if (!canvas || !canvas.width || !canvas.height) {
    error();
    return;
  }
  const imgData = canvas.toDataURL("image/png");
  if (!imgData) {
    error();
    return;
  }
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  if (isNaN(pdfWidth) || isNaN(pdfHeight) || pdfHeight <= 0) {
    error();
    return;
  }
  pdf.internal.pageSize.setHeight(pdfHeight);
  try {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  } catch (error) {
    error();
    return;
  }
  pdf.save(PDF_NAME);
  helper(); // closes all accordion headers if mode is not general
};

const error = () => {
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
