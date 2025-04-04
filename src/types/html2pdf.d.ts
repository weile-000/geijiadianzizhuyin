declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: Element): Html2PdfInstance;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    outputPdf(type: string, options?: any): Promise<any>;
    outputImg(type: string, options?: any): Promise<any>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: Element, options?: Html2PdfOptions): Html2PdfInstance;

  export default html2pdf;
} 