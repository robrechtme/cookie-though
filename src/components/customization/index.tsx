import { FunctionalComponent, h } from 'preact';
import ToggleButton from './toggleButton';
import styles from './css/customization.css';
import { useMemo, useState } from 'preact/hooks';
import Options from './options';
import TinyCollapse from 'react-tiny-collapse';
import Button from '../button';
import buttonStyles from '../button/style.css';
import { CookieOption } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';

interface Props {
  cookieOptions: CookieOption[];
  setVisible(value: boolean): void;
}

const isAnOptionEnabled = (cookieOptions: CookieOption[]) => {
  return cookieOptions.some(cookieOption => cookieOption.isEnabled === true);
};

const Customization: FunctionalComponent<Props> = ({ cookieOptions, setVisible }) => {
  const [options, setOptions] = useState(() => cookieOptions);
  const [isActive, setIsActive] = useState(false);
  const { setCookiePreferences } = useLocalStorage({ cookieOptions: cookieOptions });
  const acceptButtonLabel = useMemo(() => {
    if (!isActive && !isAnOptionEnabled(options)) {
      return 'Accept all';
    }

    return 'Accept';
  }, [isActive, options]);

  const toggleOption = (key: number) => {
    options[key] = { ...options[key], isEnabled: !options[key].isEnabled };
    setOptions([...options]);
  };

  const declineAllOptions = () => {
    const declinedOptions = options.map(option => ({ ...option, isEnabled: false }));
    setOptions(declinedOptions);
    setIsActive(false);
    setVisible(false);
    setCookiePreferences({ cookieOptions: declinedOptions, isCustomised: true });
  };

  const acceptOptions = () => {
    let acceptedOptions = options;
    if (!isActive && !isAnOptionEnabled(options)) {
      acceptedOptions = options.map(option => ({ ...option, isEnabled: true }));
      setOptions(acceptedOptions);
    }

    setIsActive(false);
    setVisible(false);
    setCookiePreferences({ cookieOptions: acceptedOptions, isCustomised: true });
  };

  return (
    <div>
      <ToggleButton
        isActive={isActive}
        toggleCustomization={() => setIsActive(prevState => !prevState)}
      />
      <TinyCollapse className={styles.collapse} isOpen={isActive} duration={250}>
        <Options options={options} onToggle={toggleOption} />
      </TinyCollapse>
      <div className={styles.acceptance}>
        <Button label="Decline" className={buttonStyles.secondary} onClick={declineAllOptions} />
        <Button label={acceptButtonLabel} onClick={acceptOptions} />
      </div>
    </div>
  );
};

export default Customization;
