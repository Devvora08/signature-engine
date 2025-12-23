'use client';

import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import DraggableField from './DraggableField';
import SignatureModal from './SignatureModal';
import { normalizeCoords } from '@/lib/coordinateUtils';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const [numPages, setNumPages] = useState(null);
  const [fields, setFields] = useState([]);
  const [nextFieldId, setNextFieldId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureField, setSignatureField] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [currentPdf, setCurrentPdf] = useState('/sample.pdf');
  const [uploadedPdfs, setUploadedPdfs] = useState([{ name: 'sample.pdf', path: '/sample.pdf' }]);
  const [uploading, setUploading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setCanvasDimensions({ width: viewport.width, height: viewport.height });
  };

  const addField = (type) => {
    const newField = {
      id: nextFieldId,
      type,
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      page: pageNumber,
    };
    setFields([...fields, newField]);
    setNextFieldId(nextFieldId + 1);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const openSignatureModal = () => {
    const sigField = fields.find(f => f.type === 'signature');
    if (!sigField) {
      alert('Please add a signature field first');
      return;
    }
    setSignatureField(sigField);
    setIsModalOpen(true);
  };

  const handleSignatureSave = (signatureData) => {
    setSignature(signatureData);
    setIsModalOpen(false);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newPdf = { name: file.name, path: result.pdfUrl };
        setUploadedPdfs([...uploadedPdfs, newPdf]);
        setCurrentPdf(result.pdfUrl);
        setFields([]);
        setSignature(null);
        setSignatureField(null);
        setSignedPdfUrl(null);
      } else {
        alert('Error uploading PDF: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSign = async () => {
    if (!signature) {
      alert('Please create a signature first');
      return;
    }

    if (!signatureField) {
      alert('No signature field found');
      return;
    }

    const normalizedCoords = normalizeCoords(
      signatureField,
      canvasDimensions.width,
      canvasDimensions.height
    );

    try {
      const response = await fetch('/api/sign-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfPath: currentPdf,
          signatureBase64: signature,
          normalizedCoords,
          pageNumber: signatureField.page,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSignedPdfUrl(result.signedPdfUrl);
        alert('PDF signed successfully!\nOriginal Hash: ' + result.originalHash + '\nSigned Hash: ' + result.signedHash);
      } else {
        alert('Error signing PDF: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Signature Injection Engine</h1>

      <div className="mb-6 flex gap-4 items-center">
        <label className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-800">
          {uploading ? 'Uploading...' : 'Upload PDF'}
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <select
          value={currentPdf}
          onChange={(e) => {
            setCurrentPdf(e.target.value);
            setFields([]);
            setSignature(null);
            setSignatureField(null);
            setSignedPdfUrl(null);
          }}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          {uploadedPdfs.map((pdf, index) => (
            <option key={index} value={pdf.path}>
              {pdf.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => addField('signature')}
          className="px-6 py-2 bg-green-600 text-white rounded font-semibold"
        >
          Add Signature Field
        </button>
        <button
          onClick={openSignatureModal}
          className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold"
        >
          Draw Signature
        </button>
        <button
          onClick={handleSign}
          className="px-6 py-2 bg-emerald-600 text-white rounded font-semibold"
        >
          Sign Document
        </button>
      </div>

      {signedPdfUrl && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="font-semibold">Document signed successfully!</p>
          <a
            href={signedPdfUrl}
            download
            className="text-blue-600 underline"
          >
            Download Signed PDF
          </a>
        </div>
      )}

      {numPages && (
        <div className="mb-4 flex gap-2 items-center">
          <button
            onClick={() => {
              setPageNumber(pageNumber - 1);
              setFields([]);
            }}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => {
              setPageNumber(pageNumber + 1);
              setFields([]);
            }}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <div ref={containerRef} className="relative border-2 border-gray-300">
        <Document
          file={currentPdf}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={onPageLoadSuccess}
          />
        </Document>

        {fields.map(field => (
          <DraggableField
            key={field.id}
            field={field}
            onUpdate={updateField}
            onDelete={deleteField}
          />
        ))}
      </div>

      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </div>
  );
}
