import { Navbar as BootstrapNavbar, Container, Button } from 'react-bootstrap';

interface NavButton {
  name: string;
  onClick: () => void;
}

interface NavbarProps {
  buttons: NavButton[];
}

const Navbar = ({ buttons }: NavbarProps) => {
  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand href="/">Piper</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <div className="ms-auto d-flex gap-2">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="outline-light"
                onClick={button.onClick}
              >
                {button.name}
              </Button>
            ))}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
