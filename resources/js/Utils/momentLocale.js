import moment from 'moment';
import 'moment/locale/km';
import 'moment/locale/zh-cn';
import { getActiveLanguage } from 'laravel-vue-i18n';

/**
 * Relative and formatted times in the reader's language.
 *
 * One module because of two traps: importing a locale file calls
 * moment.defineLocale(), which switches the *global* locale (hence the reset
 * below), and the app's codes are not moment's - kh is km, cn is zh-cn.
 */
const APP_TO_MOMENT = { kh: 'km', cn: 'zh-cn', en: 'en' };

// Registering a locale switches to it. Put it back.
moment.locale('en');

/**
 * A moment fixed to the given app locale, leaving the global default alone.
 *
 * @param {*} value  anything moment() accepts
 * @param {string} [appLocale]  an app code (kh/cn/en); the active one by default
 */
export function at(value, appLocale = null) {
    const code = appLocale || getActiveLanguage() || 'en';

    return moment(value).locale(APP_TO_MOMENT[code] || 'en');
}

export default at;
