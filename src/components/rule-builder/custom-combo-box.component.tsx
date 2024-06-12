import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { TextInput } from '@carbon/react';
import { useDebounce } from '@openmrs/esm-framework';
import styles from './custom-combo-box.scss';
import { useTranslation } from 'react-i18next';

interface CustomComboBoxProps {
  id: string;
  items: Array<Record<string, string>>;
  onChange: (selectedItem: string) => void;
  value: string;
  size: string;
}

const CustomComboBox = React.memo(({ items, onChange, value, size, id }: CustomComboBoxProps) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTermValue, setSearchTermValue] = useState<string>('');
  const conditionalValue = useDebounce(inputValue, 500);
  const selectedSearchValue = useDebounce(searchTermValue, 500);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    onChange(conditionalValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionalValue]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(selectedSearchValue.toLowerCase())),
    [items, selectedSearchValue],
  );
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSearchTermValue(value);
  };

  const handleItemClick = useCallback(
    (item: Record<string, string>) => {
      setInputValue(item.label);
      setIsDropdownVisible(false);
      onChange(item.label);
    },
    [onChange],
  );

  const handleInputFocus = useCallback(() => {
    setIsDropdownVisible(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setIsDropdownVisible(false), 100);
  }, []);

  const handleClearInput = () => {
    setInputValue('');
    setSearchTermValue('');
    onChange('');
  };

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsDropdownVisible(false);
    } else if (event.key === 'ArrowDown') {
      (dropdownRef.current?.firstChild as HTMLLIElement)?.focus();
    }
  }, []);

  return (
    <div className={styles.combobox}>
      <TextInput
        id={id}
        className={styles.textInput}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        size={size}
        placeholder={t('targetValue', 'Target value')}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      {inputValue && (
        <button onClick={handleClearInput} className={styles.deleteBtn}>
          ✕
        </button>
      )}
      {isDropdownVisible && (
        <ul id={id} className={styles.dropdown} ref={dropdownRef} onMouseDown={handleMouseDown}>
          {filteredItems.map((item, index) => (
            <li
              key={index}
              value={item.label}
              data-value={item.label}
              onClick={() => handleItemClick(item)}
              tabIndex={0}
              role="option"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default CustomComboBox;
