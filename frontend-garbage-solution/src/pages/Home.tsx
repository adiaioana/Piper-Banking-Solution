import { Container, Row, Col, Button } from 'react-bootstrap';
import { homeContent } from '../data/homeContent';

const Home = () => {


  return (
    <Container fluid>
      {/* Welcome Section - Centered */}
      <Row className="mt-4 justify-content-center">
        <Col md={6} className="text-center">
          <h1>{homeContent.welcome.title}</h1>
          <p className="lead">{homeContent.welcome.subtitle}</p>
          <p>{homeContent.welcome.description}</p>
        </Col>
      </Row>

      
      <Row className="mt-5 justify-content-end">
        <Col md={3} className="d-flex justify-content-end align-items-center">
          <div className="text-end me-4">
            <h3>{homeContent.features[0].title}</h3>
            <p>{homeContent.features[0].description}</p>
          </div>
        </Col>
        <Col md={4} className="d-flex justify-content-start">
          <img 
            src={homeContent.features[0].imageUrl}
            alt={homeContent.features[0].imageAlt}
            className="img-fluid"
          />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={4} className="d-flex justify-content-end">
          <img 
            src={homeContent.features[1].imageUrl}
            alt={homeContent.features[1].imageAlt}
            className="img-fluid"
          />
        </Col>
        <Col md={3} className="d-flex justify-content-start align-items-center">
          <div className="ms-4">
            <h3>{homeContent.features[1].title}</h3>
            <p>{homeContent.features[1].description}</p>
          </div>
        </Col>
      </Row>

      
      <Row className="mt-5 justify-content-center">
        <Col md={4} className="d-flex justify-content-center">
          <img 
            src={homeContent.features[2].imageUrl}
            alt={homeContent.features[2].imageAlt}
            className="img-fluid"
          />
        </Col>
      </Row>
      <Row className="mt-3 justify-content-center">
        <Col md={4} className="text-center">
          <h3>{homeContent.features[2].title}</h3>
          <p>{homeContent.features[2].description}</p>
        </Col>
      </Row>

      {/* Call to Action Button - Centered with Slogan */}
      <Row className="my-5 justify-content-center">
        <Col md={6} className="text-center">
          <p className="lead mb-4">{homeContent.callToAction.slogan}</p>
          <Button variant="primary" size="lg" href="/login" className="px-5">
            {homeContent.callToAction.buttonText}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 