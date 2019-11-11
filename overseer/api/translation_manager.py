from enum import Enum

from messages.lang_pl import lang_dict as lang_pl


class Language(Enum):
    POLISH = 0
    ENGLISH = 1


# Initialize languages
languages = dict()
languages[Language.POLISH] = lang_pl


def translate(message_code, lang):
    # get dictionary of specified language, if given language is not present then use POLISH as a default
    if lang in languages:
        dictionary = languages[lang]
    else:
        dictionary = languages[Language.POLISH]

    # return translation or error message if no translation is available
    return dictionary.get(message_code, 'No translation presented')
