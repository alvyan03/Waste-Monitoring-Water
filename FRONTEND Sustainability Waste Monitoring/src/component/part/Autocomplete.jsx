import React, { useState, useEffect, useRef } from "react";

export default function Autocomplete({
  data = [],
  value = "",
  onChange = () => {},
  placeholder = "",
  name = "",
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [inputValue, showSuggestions]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(true);
    const filtered = data.filter((item) =>
      item.Text.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
    onChange(val);
  };

  const handleSuggestionClick = (item) => {
    setInputValue(item.Text);
    setShowSuggestions(false);
    onChange(item);
  };

  return (
    <div className="position-relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={inputValue}
        className="form-control"
        placeholder={placeholder}
        onChange={handleInputChange}
        autoComplete="off"
        ref={inputRef}
        disabled={disabled}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="list-group"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action d-flex justify-content-between"
              onClick={() => handleSuggestionClick(item)}
              style={{ cursor: "pointer" }}
            >
              <span className="w-100 text-start">{item.Text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
