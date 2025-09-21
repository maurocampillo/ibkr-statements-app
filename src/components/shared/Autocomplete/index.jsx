import PropTypes from 'prop-types';
import { useState, useMemo, useEffect, useRef } from 'react';
import './Autocomplete.css';

const Autocomplete = ({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = 'Search and select options...',
  className = '',
  disabled = false,
  maxHeight = 200,
  showSelectAll = true,
  showClearAll = true,
  noResultsText = 'No options found matching',
  searchIconText = '🔍'
}) => {
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const autocompleteRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter options based on autocomplete input
  const filteredOptions = useMemo(() => {
    if (!autocompleteInput.trim()) {
      return options;
    }
    return options.filter(option => option.toLowerCase().includes(autocompleteInput.toLowerCase()));
  }, [options, autocompleteInput]);

  // Reset state when options change
  useEffect(() => {
    setAutocompleteInput('');
    setShowDropdown(false);
    setFocusedIndex(-1);
  }, [options]);

  const handleOptionAdd = option => {
    if (!selectedValues.includes(option)) {
      const newSelection = [...selectedValues, option];
      onSelectionChange(newSelection);
    }
    setAutocompleteInput('');
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleOptionRemove = option => {
    const newSelection = selectedValues.filter(val => val !== option);
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(options);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleInputChange = e => {
    const value = e.target.value;
    setAutocompleteInput(value);
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = e => {
    // Delay hiding dropdown to allow for clicks on options
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    }, 150);
  };

  const handleKeyDown = e => {
    if (!showDropdown || disabled) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionAdd(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        autocompleteRef.current?.blur();
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = selectedValues.length === options.length && options.length > 0;
  const isNoneSelected = selectedValues.length === 0;
  if (selectedValues.length > 0) {
    debugger;
  }
  return (
    <div className={`autocomplete-wrapper ${className}`}>
      {options.length > 0 && (
        <>
          {(showSelectAll || showClearAll) && (
            <div className='autocomplete-header'>
              <div className='autocomplete-actions'>
                {showSelectAll && (
                  <button
                    onClick={handleSelectAll}
                    disabled={isAllSelected || disabled}
                    className='autocomplete-action-btn select-all'
                  >
                    Select All
                  </button>
                )}
                {showClearAll && (
                  <button
                    onClick={handleClearAll}
                    disabled={isNoneSelected || disabled}
                    className='autocomplete-action-btn clear-all'
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          <div className='autocomplete-container' ref={autocompleteRef}>
            <div className='autocomplete-input-wrapper'>
              <input
                type='text'
                value={autocompleteInput}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className='autocomplete-input'
                disabled={disabled}
              />
              <span className='autocomplete-icon'>{searchIconText}</span>
            </div>

            {showDropdown && filteredOptions.length > 0 && (
              <div
                className='autocomplete-dropdown'
                ref={dropdownRef}
                style={{ maxHeight: `${maxHeight}px` }}
              >
                {filteredOptions.map((option, index) => (
                  <div
                    key={option}
                    className={`autocomplete-option ${
                      index === focusedIndex ? 'focused' : ''
                    } ${selectedValues.includes(option) ? 'selected' : ''}`}
                    onClick={() => handleOptionAdd(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className='option-text'>{option}</span>
                    {selectedValues.includes(option) && <span className='option-checkmark'>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {showDropdown && filteredOptions.length === 0 && autocompleteInput && (
              <div className='autocomplete-dropdown'>
                <div className='autocomplete-no-results'>
                  {noResultsText} "{autocompleteInput}"
                </div>
              </div>
            )}
          </div>

          {selectedValues.length > 0 && (
            <div className='selected-values'>
              <div className='selected-values-header'>Selected Options:</div>
              <div className='selected-values-list'>
                {selectedValues.map(value => (
                  <div key={value} className='selected-value-tag'>
                    <span className='tag-text'>{value}</span>
                    <button
                      onClick={() => handleOptionRemove(value)}
                      className='tag-remove'
                      aria-label={`Remove ${value}`}
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='autocomplete-summary'>
            {isNoneSelected ? (
              <span className='summary-text'>Showing all options ({options.length})</span>
            ) : (
              <span className='summary-text'>
                Showing {selectedValues.length} of {options.length} options
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

Autocomplete.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedValues: PropTypes.arrayOf(PropTypes.string),
  onSelectionChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  maxHeight: PropTypes.number,
  showSelectAll: PropTypes.bool,
  showClearAll: PropTypes.bool,
  noResultsText: PropTypes.string,
  searchIconText: PropTypes.string
};

export default Autocomplete;
