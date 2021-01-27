import { h } from 'preact';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import mockPolicies from './__mocks__/policies';
import { COOKIE_PREFERENCES_KEY } from '../hooks/useCookie';
import mockConfig, { dutchMockConfig } from './__mocks__/config';
import CookieThough, { App } from '../components/app';
import clearCookies from './utils/clearCookies';
import { CookiePreferences } from '../types';

describe('Cookie Though', () => {
  afterEach(() => {
    clearCookies();
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  describe('init function', () => {
    beforeEach(() => {
      const manageCookiesElement = document.createElement('button');
      manageCookiesElement.id = 'manage-cookie-though';
      document.body.append(manageCookiesElement);
    });

    it('can render the app based on the initCookieThough function', () => {
      CookieThough.init({ ...mockConfig, onPreferencesChanged: () => jest.fn() });

      expect(document.querySelector('.cookie-though')).toBeDefined();
    });

    it('can switch the config', () => {
      CookieThough.init({ ...mockConfig, onPreferencesChanged: () => jest.fn() });

      let cookiePolicyLink = document.querySelector('a');
      expect(cookiePolicyLink?.text).toEqual(mockConfig.cookiePolicy.label);

      CookieThough.init({ ...dutchMockConfig, onPreferencesChanged: () => jest.fn() });
      expect(document.getElementsByClassName('cookie-though').length).toEqual(1);
      cookiePolicyLink = document.querySelector('a');
      expect(cookiePolicyLink?.text).toEqual(dutchMockConfig.cookiePolicy.label);
    });

    it('can hide the cookie wall with the setVisible function', () => {
      const { setVisible } = CookieThough.init({
        ...mockConfig,
        onPreferencesChanged: () => jest.fn(),
      });

      expect(document.querySelector('.cookie-though')).toBeDefined();
      expect(document.querySelector('.visible')).toBeDefined();
      setVisible(false);
      expect(document.querySelector('.visible')).toBeNull();
    });

    it('will call the onPreferencesChanged callback when the preferences are updated', () => {
      const onPreferencesChanged = jest.fn((preferences: CookiePreferences) => {
        expect(preferences).toEqual({
          cookieOptions: [
            {
              id: 'essential',
              isEnabled: true,
            },
            {
              id: 'functional',
              isEnabled: true,
            },
            {
              id: 'analytics',
              isEnabled: true,
            },
            {
              id: 'marketing',
              isEnabled: true,
            },
          ],
          isCustomised: true,
        });
      });
      CookieThough.init({ ...mockConfig, onPreferencesChanged });

      const acceptAllButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent === 'Accept all',
      );
      acceptAllButton?.click();
      expect(onPreferencesChanged).toBeCalledTimes(1);
    });
  });

  describe('without user preferences stored in local storage', () => {
    it('should show the cookie wall', () => {
      const setVisible = jest.fn((value: boolean) => {
        expect(value).toBeTruthy();
      });
      mount(
        <div className="cookie-though">
          <App
            policies={mockConfig.policies}
            permissionLabels={mockConfig.permissionLabels}
            setVisible={setVisible}
            onPreferencesChanged={jest.fn()}
          />
        </div>,
        { attachTo: document.body },
      );

      expect(setVisible).toBeCalled();
    });
  });

  describe('with user preferences stored in a cookie', () => {
    const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
      isCustomised: false,
      cookieOptions: mockConfig.policies.map(policy => ({ ...policy, isEnabled: false })),
    };

    it('should not show the cookie wall', () => {
      document.cookie = `${COOKIE_PREFERENCES_KEY}=${JSON.stringify({
        ...DEFAULT_COOKIE_PREFERENCES,
        isCustomised: true,
      })}`;
      const setVisible = function () {
        throw new Error('should not be called');
      };
      mount(
        <div className="cookie-though">
          <App
            policies={mockPolicies}
            permissionLabels={mockConfig.permissionLabels}
            setVisible={setVisible}
            onPreferencesChanged={jest.fn()}
          />
        </div>,
        { attachTo: document.body },
      );
    });

    it("should show the cookie wall if the cookie preferences aren't customised", () => {
      const setVisible = jest.fn((value: boolean) => {
        expect(value).toBeTruthy();
      });

      mount(
        <div className="cookie-though">
          <App
            policies={mockPolicies}
            permissionLabels={mockConfig.permissionLabels}
            setVisible={setVisible}
            onPreferencesChanged={jest.fn()}
          />
        </div>,
        { attachTo: document.body },
      );

      expect(setVisible).toBeCalled();
    });
  });

  it('should render properly', () => {
    const wrapper = shallow(
      <body>
        <button id="manage-cookie-though"></button>
        <div className="cookie-though">
          <App
            policies={mockPolicies}
            permissionLabels={mockConfig.permissionLabels}
            setVisible={() => {
              return;
            }}
            onPreferencesChanged={jest.fn()}
          />
        </div>
      </body>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
