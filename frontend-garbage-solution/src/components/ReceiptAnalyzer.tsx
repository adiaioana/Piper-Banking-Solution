import React, { useState, useRef, ChangeEvent } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';

interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
}

interface ReceiptAnalyzerProps {
  onAnalysisComplete?: (data: ReceiptData) => void;
  className?: string;
}

const ReceiptAnalyzer: React.FC<ReceiptAnalyzerProps> = ({
  onAnalysisComplete,
  className = ''
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAnalysisResult(null);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeReceipt = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // In a real implementation, you would send the image to your backend
      // which would then use Google Cloud Vision API or similar to analyze the receipt
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockResult: ReceiptData = {
        merchant: "Grocery Store",
        date: new Date().toLocaleDateString(),
        total: 42.99,
        items: [
          { description: "Milk", amount: 3.99, quantity: 1 },
          { description: "Bread", amount: 2.49, quantity: 2 },
          { description: "Eggs", amount: 4.99, quantity: 1 },
          { description: "Apples", amount: 5.99, quantity: 1 }
        ]
      };
      
      setAnalysisResult(mockResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResult);
      }
    } catch (err) {
      console.error('Error analyzing receipt:', err);
      setError('Failed to analyze receipt. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className}>
      <Card.Header>
        <h5 className="mb-0">Receipt Analyzer</h5>
      </Card.Header>
      <Card.Body>
        {!image && !analysisResult && (
          <div className="text-center p-4">
            <Form.Group controlId="receiptImage">
              <Form.Label>Upload a receipt image</Form.Label>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="d-none"
                />
                <small className="text-muted">
                  Supported formats: JPEG, PNG (max 5MB)
                </small>
              </div>
            </Form.Group>
          </div>
        )}
        
        {image && !analysisResult && (
          <div>
            <div className="mb-3">
              <img 
                src={image} 
                alt="Receipt" 
                className="img-fluid rounded border"
                style={{ maxHeight: '300px' }}
              />
            </div>
            <div className="d-grid">
              <Button 
                variant="primary" 
                onClick={analyzeReceipt}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Receipt'
                )}
              </Button>
            </div>
          </div>
        )}
        
        {analysisResult && (
          <div>
            <h6 className="mb-3">Analysis Results</h6>
            <div className="mb-3">
              <p><strong>Merchant:</strong> {analysisResult.merchant}</p>
              <p><strong>Date:</strong> {analysisResult.date}</p>
              <p><strong>Total:</strong> ${analysisResult.total.toFixed(2)}</p>
            </div>
            
            <h6 className="mb-2">Items</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td className="text-end">{item.quantity || 1}</td>
                      <td className="text-end">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="d-grid gap-2 mt-3">
              <Button variant="outline-secondary" onClick={resetAnalyzer}>
                Analyze Another Receipt
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReceiptAnalyzer; 