import moment from 'moment';
import 'moment/locale/km';
import 'moment/locale/zh-cn';
import { getActiveLanguage } from 'laravel-vue-i18n';

/**
 * Relative and formatted times in the reader's language.
 *
 * Two traps live here, which is why this is one module rather than a couple of
 * lines repeated per component.
 *
 * The first is that moment.defineLocale() sets the *global* locale as a side
 * effect, and that is what importing a locale file does. Pulling in km and
 * zh-cn to translate one timestamp left moment globally on zh-cn, so all 27
 * files that call moment(...).format(...) without naming a locale started
 * writing Chinese month names. The reset below undoes that: locales are
 * registered and available, and the default stays English.
 *
 * The second is that the app's language codes are not moment's - kh is km, and
 * cn is zh-cn - so asking moment for the app's code silently gets you English.
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
