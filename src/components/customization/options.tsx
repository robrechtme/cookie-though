import { FunctionalComponent, h } from 'preact';
import Option from './option';
import './css/options.css';
import { Config, CookieOption } from '../../types';

interface Props {
  isOpen: boolean;
  options: CookieOption[];
  cookiePolicy?: Config['cookiePolicy'];
  essentialLabel?: Config['essentialLabel'];
  onToggle: (key: number) => void;
}

const Options: FunctionalComponent<Props> = ({ isOpen, options, essentialLabel, onToggle }) => {
  const cookies = options.map((option, i) => (
    <Option
      key={i}
      isOpen={isOpen}
      option={option}
      essentialLabel={essentialLabel}
      onToggle={() => onToggle(i)}
    />
  ));

  return <div className="ct-policies">{cookies}</div>;
};

export default Options;
