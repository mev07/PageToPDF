const JSPDF_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const ERR_MSG = "Error occured";
const USER_ERR_MSG = "Das Erstellen des PDFs ist fehlgeschlagen";
const PDF_NAME = "section.pdf";
const AREA = document.getElementById("container");

const load = (src) => {
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

const init = async () => {
  try {
    await load(JSPDF_URL);
    await load(HTML2CANVAS_URL);
    create();
  } catch (error) {
    error();
    return;
  }
};

const create = async () => {
  helper(); // opens all accordion headers
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
  const elem = AREA == undefined ? document.body : AREA;
  const canvas = await html2canvas(elem);
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
  helper(); // closes all accordion headers
};

const error = () => {
  console.error(ERR_MSG);
  alert(USER_ERR_MSG);
};

const helper = () => {
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
