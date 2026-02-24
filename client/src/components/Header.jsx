import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <div className="logo-icon">
            <p>AN</p>
          </div>
          <h1 className="header-title">
            AI Code <span className="title-accent">Reviewer</span>
          </h1>
        </div>
        <p className="header-subtitle">Powered by NVIDIA AI and OpenRouter.</p>
      </div>
    </header>
  );
};

export default Header;
