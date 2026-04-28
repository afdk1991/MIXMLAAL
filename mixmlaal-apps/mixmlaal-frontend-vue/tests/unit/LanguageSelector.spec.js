import { mount } from '@vue/test-utils';
import LanguageSelector from '@/components/LanguageSelector.vue';
import { useI18n } from 'vue-i18n';

// Mock vue-i18n
jest.mock('vue-i18n', () => ({
  useI18n: jest.fn(() => ({
    locale: 'zh-CN',
    setLocale: jest.fn(),
  })),
}));

describe('LanguageSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(LanguageSelector);
  });

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  test('toggles dropdown when button is clicked', async () => {
    expect(wrapper.find('.dropdown-menu').isVisible()).toBe(false);

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.dropdown-menu').isVisible()).toBe(true);

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.dropdown-menu').isVisible()).toBe(false);
  });

  test('renders language options', async () => {
    await wrapper.find('button').trigger('click');

    const languageOptions = wrapper.findAll('.dropdown-item');
    expect(languageOptions.length).toBe(2);
    expect(languageOptions[0].text()).toBe('简体中文');
    expect(languageOptions[1].text()).toBe('English');
  });

  test('changes language when option is clicked', async () => {
    const { setLocale } = useI18n();

    await wrapper.find('button').trigger('click');
    await wrapper.findAll('.dropdown-item')[1].trigger('click');

    expect(setLocale).toHaveBeenCalledWith('en-US');
  });
});
