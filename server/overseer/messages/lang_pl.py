import messages.message_codes as message

lang_dict = dict()

lang_dict[message.error_login_already_used] = 'Podany login jest już zajęty'
lang_dict[message.error_full_room] = 'Pokój jest pełny'
lang_dict[message.error_access_token_expired] = 'Token uwierzytelniający stracił ważność'
lang_dict[message.error_refresh_token_expired] = 'Sesja wygasła. Zaloguj sie jako nowy użytkownik'
lang_dict[message.error_user_already_in_room] = 'Już jesteś w pokoju. Nie możesz dołączyć do następnego'
lang_dict[message.error_room_does_not_exist] = 'Podany pokój nie istnieje'
lang_dict[message.error_user_id_non_existent] = 'Nie istnieje użytkownik skojarzony z podanym tokenem autoryzującym'
