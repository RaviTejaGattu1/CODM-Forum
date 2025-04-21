import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onSearch, onThemeChange, theme }) => {
  return (
    <div className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>CODM Forum</h1>
      </Link>
      <div>
        <input type="text" placeholder="Search" onChange={(e) => onSearch(e.target.value)} />
        <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
          <option value="dark">Dark Theme</option>
          <option value="light">Light Theme</option>
          <option value="codm">CODM Theme</option>
        </select>
        <Link to="/">Home</Link>
        <Link to="/create">Create New Post</Link>
      </div>
    </div>
  );
};

export default Header;