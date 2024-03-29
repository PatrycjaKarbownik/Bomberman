from engine.id_manager import IdManager

id_manager = IdManager()

error_login_already_used = id_manager.get_id()
error_full_room = id_manager.get_id()
error_access_token_expired = id_manager.get_id()
error_refresh_token_expired = id_manager.get_id()
error_user_already_in_room = id_manager.get_id()
error_room_does_not_exist = id_manager.get_id()
error_user_id_non_existent = id_manager.get_id()