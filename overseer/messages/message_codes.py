from engine.id_manager import IdManager

id_manager = IdManager()

error_login_already_used = id_manager.get_id()
error_full_room = id_manager.get_id()
error_access_token_expired = id_manager.get_id()
error_refresh_token_expired = id_manager.get_id()
