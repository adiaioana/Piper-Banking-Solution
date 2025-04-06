import React, { useState } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import { getNearbyLocations, NearbyLocation } from '../services/maps.service';

const NearbyATMs: React.FC = () => {
  const [atms, setAtms] = useState<NearbyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindATMs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const request = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      console.log(request);
      const nearbyATMs = await getNearbyLocations(request);
      console.log(nearbyATMs);
      setAtms(nearbyATMs);
    } catch (err) {
      console.error('Error finding ATMs:', err);
      setError('Failed to find nearby ATMs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Find Nearby ATMs</Card.Title>
        
        <Button 
          variant="primary" 
          onClick={handleFindATMs}
          disabled={loading}
          className="mb-3"
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Finding ATMs...
            </>
          ) : (
            'Find Nearby ATMs'
          )}
        </Button>

        {error && (
          <div className="text-danger mb-3">
            {error}
          </div>
        )}

        {atms.length > 0 && (
          <ListGroup>
            {atms.map((atm) => (
              <ListGroup.Item key={atm.id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{atm.bankName}</h5>
                    <p className="mb-1">{atm.name}</p>
                    <p className="mb-1 text-muted small">{atm.address}</p>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${atm.isOpen ? 'bg-success' : 'bg-danger'} mb-2`}>
                      {atm.isOpen ? 'Open' : 'Closed'}
                    </span>
                    <p className="mb-0 text-muted small">
                      {atm.distance.toFixed(1)} km away
                    </p>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default NearbyATMs; 