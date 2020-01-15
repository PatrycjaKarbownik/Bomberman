// determine type of messages received from server
export enum MessageType {
  AUTHORIZATION = "authorization",
  MAP_INFO = "mapInfo",
  INITIAL_PLAYERS_INFO = "initialPlayersInfo",
  START = "start",
  OTHER_PLAYER_UPDATE = "otherPlayerUpdate",
  PLAYER_UPDATE = "playerUpdate",
  LAST_REQUEST = "lastReviewedRequestId",
  BOMB_PLACED = "bombPlaced",
  BOMB_REJECTED = "bombRejected",
  BOMB_EXPLODED = "bombExploded",
  BONUS_PICKED_UP = "bonusPickedUp",
  GAME_RESULT = "gameResult",
  BOMB_MOVEMENT = "bombMovement",
}
