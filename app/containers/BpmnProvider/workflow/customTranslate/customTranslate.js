import translations from './translationsGerman';

export default function customTranslate(t, r) {
  const replacements = r || {};
  const template = translations[t] || t;
  return template.replace(/{([^}]+)}/g, (_, key) => {
	  let str = replacements[key];
	  if(translations[replacements[key]] != null && translations [replacements[key]] !== 'undefined'){
		  str = translations[replacements[key]];
	  }
    return  str || `{${key}}`;
  });
}
