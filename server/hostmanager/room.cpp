#include "room.h"

#include <QDebug>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonDocument>

Room::Room(const QStringList &expectedPlayers_, QObject *parent)
    : QObject(parent),
      m_expectedPlayers(expectedPlayers_)
{
    m_startTimeout.setSingleShot(true);
    connect (&m_startTimeout, &QTimer::timeout, this, &Room::onStartTimeout);
    m_startTimeout.start(START_TIMEOUT);
}

Room::~Room()
{
    for (auto player : m_players) {
        if (player) {
            player->deleteLater();
        }
    }
}

bool Room::addPlayer(Player *player_)
{
    if (!player_) {
        qWarning() << "[Room] Room received nullptr instead of player";
        return false;
    }
    if (m_players.size() >= MAX_PLAYERS) {
        qWarning() << "[Room] Player " << player_->getUsername() << " tried to enter full room";
        return false;
    }

    m_players.push_back(player_);
    connect(player_, &Player::disconnected, this, &Room::onPlayerDisconnected);
    connect(player_, &Player::moveRequest, this, &Room::onPlayerMoveRequest);
    connect(player_, &Player::bombRequest, this, &Room::onPlayerBombRequest);

    if (m_expectedPlayers.length() == static_cast<int>(m_players.size())) {
        onEveryoneConnected();
        onStartTimeout();
    }

    qInfo() << "[Room] Added player " << player_->getUsername() << " to room";

    return true;
}

bool Room::expectsPlayer(const QString &username_)
{
    return m_expectedPlayers.contains(username_);
}

void Room::startGame()
{
    // Calculate sizes of tiles and players for collision purposes
    m_tileWidth = static_cast<double>(CANVAS_WIDTH) / static_cast<double>(MAP_SIZE);
    m_playerWidth = m_tileWidth * 0.70;

    m_map.generate(MAP_SIZE);
    broadcastMap(m_map.dumpMap(m_tileWidth));

    resetPlayers();
    broadcastPlayerInfo();
    broadcastStart();
}

void Room::sendHelloMessage(Player *player_)
{
    QJsonObject helloMessage;
    helloMessage.insert("messageType", "hello");

    QString messageText = QString("Hello!");
    helloMessage.insert("content", messageText);

    QJsonDocument doc(helloMessage);
    player_->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
}

void Room::broadcastMap(const QJsonArray &map_)
{
    QJsonObject message;
    message.insert("messageType", "mapInfo");
    message.insert("content", map_);

    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::broadcastStart()
{
    QJsonObject message;
    message.insert("messageType", "start");
    message.insert("content", "");

    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::broadcastPlayerInfo()
{
    QJsonObject message;
    message.insert("messageType", "initialPlayersInfo");

    QJsonArray content;
    for (const Player* player : m_players) {
        QJsonObject playerObject;
        playerObject.insert("username", player->getUsername());
        playerObject.insert("inGameId", static_cast<qint64>(player->getInGameId()));
        playerObject.insert("bombPusher", player->hasPushBonus());
        playerObject.insert("speed", static_cast<qint64>(player->getSpeed()));
        playerObject.insert("x", player->getPosX());
        playerObject.insert("y", player->getPosY());
        playerObject.insert("alive", player->isAlive());
        playerObject.insert("bombLimit", static_cast<qint64>(player->getBombLimit()));
        content.append(playerObject);
    }

    message.insert("content", content);
    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::broadcastMapChanges(TileList wallsToRemove_, TileList bonusesToRemove_,
                               TileList bonusesToAdd_, TileList flames_,
                               std::list<std::shared_ptr<Bomb> > bombsToRemove_)
{
    QJsonObject message;
    message.insert("messageType", "bombExploded");
    QJsonObject content;

    QJsonArray bonusesRemovedArray = tilesListToJsonArray(bonusesToRemove_);
    QJsonArray wallsRemovedArray = tilesListToJsonArray(wallsToRemove_);
    QJsonArray bonusesAddedArray = tilesListToJsonArray(bonusesToAdd_);
    QJsonArray flamesArray = tilesListToJsonArray(flames_, true);
    QJsonArray bombsRemovedArray;

    for (const auto& bomb : bombsToRemove_) {
        QJsonObject removedBomb;
        removedBomb.insert("x", bomb->posX());
        removedBomb.insert("y", bomb->posY());

        bombsRemovedArray.append(removedBomb);
    }

    content.insert("removedFragileWalls", wallsRemovedArray);
    content.insert("removedBonuses", bonusesRemovedArray);
    content.insert("removedBombs", bombsRemovedArray);
    content.insert("newBonuses", bonusesAddedArray);
    content.insert("flames", flamesArray);
    message.insert("content", content);
    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::broadcastGameResult()
{
    QJsonObject message;
    message.insert("messageType", "gameResult");

    QJsonArray playersResults;
    for (const Player* player : m_players) {
        QJsonObject result;
        result.insert("username", player->getUsername());
        result.insert("place", static_cast<qint64>(player->getPlace()));

        playersResults.append(result);
    }

    message.insert("content", playersResults);
    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::broadcastBonusPickUp(const MapTile &tile_)
{
    QJsonObject message;
    message.insert("messageType", "bonusPickedUp");

    QJsonObject content;
    content.insert("x", static_cast<double>(tile_.x) * m_tileWidth);
    content.insert("y", static_cast<double>(tile_.y) * m_tileWidth);
    content.insert("id", tile_.id);

    message.insert("content", content);
    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::sendReviewedRequestId(const Player *player_, const qint32 requestId_)
{
    QJsonObject message;
    message.insert("messageType", "lastReviewedRequestId");
    message.insert("content", requestId_);

    QJsonDocument doc(message);
    player_->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
}

void Room::sendPlayerUpdate(const Player *player_)
{
    QJsonObject message;
    message.insert("messageType", "playerUpdate");

    QJsonObject content;
    content.insert("x", player_->getPosX());
    content.insert("y", player_->getPosY());
    content.insert("alive", player_->isAlive());
    content.insert("speed", static_cast<qint64>(player_->getSpeed()));
    content.insert("bombPusher", player_->hasPushBonus());
    content.insert("bombLimit", static_cast<qint64>(player_->getBombLimit()));

    message.insert("content", content);

    QJsonDocument doc(message);
    player_->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
}

void Room::sendOtherPlayerUpdate(const Player *updatedPlayer_)
{
    QJsonObject message;
    message.insert("messageType", "otherPlayerUpdate");

    QJsonObject content;
    content.insert("inGameId", static_cast<qint64>(updatedPlayer_->getInGameId()));
    content.insert("x", updatedPlayer_->getPosX());
    content.insert("y", updatedPlayer_->getPosY());
    content.insert("alive", updatedPlayer_->isAlive());

    message.insert("content", content);

    QJsonDocument doc(message);
    for (const auto player : m_players) {
        if (player == updatedPlayer_) {
            continue;
        }

        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::sendBombPlaced(const Player *bombOwner_, double bombX_, double bombY_)
{
    QJsonObject message;
    message.insert("messageType", "bombPlaced");

    QJsonObject content;
    content.insert("x", bombX_);
    content.insert("y", bombY_);

    message.insert("content", content);

    QJsonDocument doc(message);
    for (const auto player : m_players) {
        if (player == bombOwner_) {
            continue;
        }

        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
    }
}

void Room::sendBombReject(const Player *player_, double bombX_, double bombY_)
{
    QJsonObject message;
    message.insert("messageType", "bombRejected");

    QJsonObject content;
    content.insert("x", bombX_);
    content.insert("y", bombY_);

    message.insert("content", content);

    QJsonDocument doc(message);
    player_->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));

}

void Room::resetPlayers()
{
    // Calculate starting positions for players
    double delta = (m_tileWidth - m_playerWidth) / 2;
    std::list<double> posXList {delta, CANVAS_WIDTH - m_playerWidth - delta,
                delta, CANVAS_WIDTH - m_playerWidth - delta};
    std::list<double> posYList {delta, CANVAS_WIDTH - m_playerWidth - delta,
                CANVAS_WIDTH - m_playerWidth - delta, delta};
    auto posXIter = posXList.begin();
    auto posYIter = posYList.begin();

    quint32 playerId = 0;
    for (Player* player : m_players) {
        player->setInGameId(playerId++);
        player->setLastRejectedRequestId(0);
        player->setSpeed(2);
        player->setBombLimit(1);
        player->setPlacedBombs(0);
        player->setBombRange(1);
        player->setPushBonus(false);
        player->setAlive(true);
        player->setLastRejectedRequestId(-1);
        player->setPlace(0);
        player->setPosX(*posXIter++);
        player->setPosY(*posYIter++);
    }

    m_lastPlace = static_cast<quint32>(m_players.size());
}

void Room::checkIfGameEnd()
{
    quint32 alivePlayers = 0;
    Player *livingPlayer = nullptr;

    for (const auto player : m_players) {
        if (player->isAlive()) {
            ++alivePlayers;
            livingPlayer = player;
        }
    }

    if (alivePlayers >= 2) {
        return;
    }

    if (alivePlayers == 1) {
        livingPlayer->setPlace(1);
    } else {

        // last players died in explosion so move everyone up in ranking
        for (const auto player : m_players) {
            player->setPlace(player->getPlace() - 1);
        }
    }

    broadcastGameResult();
}

bool Room::isNotMovingTooFast(const Player *player_, const double x_, const double y_)
{
    double deltaX = player_->getPosX() - x_;
    double deltaY = player_->getPosY() - y_;
    deltaX = (deltaX > 0) ? deltaX : -deltaX;
    deltaY = (deltaY > 0) ? deltaY : -deltaY;
    double playerSpeed = player_->getSpeed();

    // Instead of checking if player is going vertically or horizontally just and deltas
    if (deltaX + deltaY <= playerSpeed + TOLERATION) {
        return true;
    } else {
        return false;
    }
}

bool Room::isColliding(const double playerPosX_, const double playerPosY_, const MapTile &tile)
{
    return (playerPosX_ < static_cast<double>(tile.x) * m_tileWidth + m_tileWidth &&
            playerPosX_ + m_playerWidth > static_cast<double>(tile.x) * m_tileWidth &&
            playerPosY_ < static_cast<double>(tile.y) * m_tileWidth + m_tileWidth &&
            playerPosY_ + m_playerWidth > static_cast<double>(tile.y) * m_tileWidth);
}

bool Room::hasCollidingTile(Player *player_, const double playerNewPosx_, const double playerNewPosy_)
{
    // Calculate coordinates for top left tile
    auto topLeftX = static_cast<qint32>(playerNewPosx_ / m_tileWidth) - 1;
    auto topLeftY = static_cast<qint32>(playerNewPosy_ / m_tileWidth) - 1;

    for (qint32 xCoord = topLeftX; xCoord < topLeftX + 3; ++xCoord) {
        for (qint32 yCoord = topLeftY; yCoord < topLeftY + 3; ++yCoord) {
            if (xCoord < 0 || yCoord < 0 || xCoord >= MAP_SIZE || yCoord >= MAP_SIZE) {
                continue;
            }

            auto mapTile = m_map[yCoord][xCoord];
            if (mapTile.type == TileType::Nothing && !mapTile.bomb) {
                continue;
            }

            // Don't check bombs under player (which he placed)
            if (player_->areCoordsOfBombUnderPlayer(xCoord, yCoord)) {
                continue;
            }

            if (isColliding(playerNewPosx_, playerNewPosy_, mapTile)) {
                return true;
            }

        }
    }

    return false;
}

void Room::killPlayersOnTile(const MapTile &tile)
{
    for (auto player : m_players) {
        if (!player->isAlive()) {
            continue;
        }
        if (isColliding(player->getPosX(), player->getPosY(), tile)) {
            player->setAlive(false);
            player->setPlace(m_lastPlace);

            // Send information to player about its death
            sendPlayerUpdate(player);

            // Inform other players about death
            sendOtherPlayerUpdate(player);
            m_playerWasKilled = true;
        }
    }
}

void Room::checkAndPickUpBonus(Player *player_)
{
    auto xCoord = static_cast<quint16>(player_->getPosX() / m_tileWidth);
    auto yCoord = static_cast<quint16>(player_->getPosY() / m_tileWidth);

    std::list<std::pair<quint16, quint16>> coordsList = {
        {xCoord - 1, yCoord}, {xCoord, yCoord}, {xCoord + 1, yCoord}, {xCoord, yCoord - 1}, {xCoord, yCoord + 1} };

    for (const auto& coord : coordsList) {
        auto x = coord.first;
        auto y = coord.second;

        if (x >= MAP_SIZE || y >= MAP_SIZE) {
            continue;
        }

        auto& tile = m_map[y][x];
        if (tile.bonus == BonusType::None) {
            continue;
        }

        if (isColliding(player_->getPosX(), player_->getPosY(), tile)) {
            pickUpBonus(player_, tile.bonus);
            broadcastBonusPickUp(tile);
            tile.bonus = BonusType::None;
            sendPlayerUpdate(player_);
        }
    }
}

void Room::pickUpBonus(Player *player_, const BonusType bonus_)
{
    switch (bonus_) {

    case BonusType::PushBomb:
        player_->setPushBonus(true);
        break;

    case BonusType::DecreaseSpeed:
        if (player_->getSpeed() > 1) {
            player_->setSpeed(player_->getSpeed() - 1);
        }
        break;

    case BonusType::IncreaseSpeed:
        player_->setSpeed(player_->getSpeed() + 1);
        break;

    case BonusType::DecreaseBombLimit:
        if (player_->getBombLimit() > 1) {
            player_->setBombLimit(player_->getBombLimit() - 1);
        }
        break;

    case BonusType::IncreaseBombLimit:
        player_->setBombLimit(player_->getBombLimit() + 1);
        break;

    case BonusType::IncreaseBombRange:
        player_->setBombRange(player_->getBombRange() + 1);
        break;

    case BonusType::DecreaseBombRange:
        if (player_->getBombRange() > 1) {
            player_->setBombRange(player_->getBombRange() - 1);
        }
        break;

    default:
        break;
    }
}

quint32 Room::amountOfPlayerBombs(Player *player_)
{
    quint32 count = 0;

    for (const auto& bombItem : m_bombs) {
        auto bomb = bombItem.second;
        if (bomb->owner() == player_) {
            ++count;
        }
    }

    return count;
}

quint32 Room::amountOfAlivePlayers()
{
    quint32 count = 0;
    for (const auto player : m_players) {
        if (player->isAlive()) {
            ++count;
        }
    }

    return count;
}

// TODO How to do it properly??
std::unordered_set<qint32> Room::findBombsInExplosionRange(quint16 bombX_, quint16 bombY_, qint32 bombRange_)
{
    std::unordered_set<qint32> explodedBombs;
    auto bombRange = static_cast<quint16>(bombRange_);

    // From middle to right
    for (quint16 x = bombX_ + 1; x <= bombX_ + bombRange; ++x) {
        if (x >= MAP_SIZE || m_map[bombY_][x].type != TileType::Nothing) {
            break;
        }
        if (m_map[bombY_][x].bomb) {
            explodedBombs.insert(m_map[bombY_][x].bomb->id());
        }
    }

    // From middle to left
    for (quint16 x = bombX_ - 1; x >= bombX_ - bombRange; --x) {
        if (x >= MAP_SIZE || m_map[bombY_][x].type != TileType::Nothing) {
            break;
        }
        if (m_map[bombY_][x].bomb) {
            explodedBombs.insert(m_map[bombY_][x].bomb->id());
        }
    }

    // From middle to bottom
    for (quint16 y = bombY_ + 1; y <= bombY_ + bombRange; ++y) {
        if (y >= MAP_SIZE || m_map[y][bombX_].type != TileType::Nothing) {
            break;
        }
        if (m_map[y][bombX_].bomb) {
            explodedBombs.insert(m_map[y][bombX_].bomb->id());
        }
    }

    // From middle to top
    for (quint16 y = bombY_ - 1; y >= bombY_ - bombRange; --y) {
        if (y >= MAP_SIZE || m_map[y][bombX_].type != TileType::Nothing) {
            break;
        }
        if (m_map[y][bombX_].bomb) {
            explodedBombs.insert(m_map[y][bombX_].bomb->id());
        }
    }

    return explodedBombs;
}

std::unordered_set<qint32> Room::findExplodedBombs(std::shared_ptr<Bomb> firstExplodedBomb_)
{
    // We are creating two collections: explodedBombs are bombs that their explosion is already calculated,
    // bombsToExplode are just about to be calculated
    std::unordered_set<qint32> alreadyHandledBombs;
    std::unordered_set<qint32> bombsToExplode;

    // bomb_ is first bomb which is about to explode
    bombsToExplode.insert(firstExplodedBomb_->id());

    while(bombsToExplode.size() > 0) {
        // Pop first element
        qint32 id = *(bombsToExplode.begin());
        bombsToExplode.erase(bombsToExplode.begin());
        alreadyHandledBombs.insert(id);

        // Find bombs affected by explosion
        auto bomb = m_bombs[id];
        auto xCoord = static_cast<quint16>(bomb->posX() / m_tileWidth);
        auto yCoord = static_cast<quint16>(bomb->posY() / m_tileWidth);
        auto bombsInRange = findBombsInExplosionRange(xCoord, yCoord, bomb->range());

        // Check if bombs are already not in one of collections
        for (const qint32 bombId : bombsInRange) {
            if (alreadyHandledBombs.find(bombId) == alreadyHandledBombs.end() &&
                    bombsToExplode.find(bombId) == bombsToExplode.end()) {
                bombsToExplode.insert(bombId);
            }
        }
    }

    return alreadyHandledBombs;
}

// TODO reduce code duplication
// TODO Please refactor me please
// TODO Please
std::set<std::pair<quint16, quint16> > Room::findExplodedTiles(const std::unordered_set<qint32> &explodedBombs)
{
    std::set<std::pair<quint16, quint16>> explodedTiles;

    for (const qint32 bombId : explodedBombs) {
        auto bomb = m_bombs[bombId];
        auto xCoord = static_cast<quint16>(bomb->posX() / m_tileWidth);
        auto yCoord = static_cast<quint16>(bomb->posY() / m_tileWidth);

        // From middle to right
        // This one includes tile on which bomb is places so tile with bomb is also added as exploded
        for (quint16 x = xCoord; x <= xCoord + bomb->range(); ++x) {
            if (x >= MAP_SIZE) {
                break;
            }
            if (m_map[yCoord][x].type == TileType::Wall) {
                break;
            }
            explodedTiles.insert(std::make_pair(x, yCoord));
            if (m_map[yCoord][x].type == FragileWall) {
                break;
            }
        }

        // From middle to left
        for (quint16 x = xCoord - 1; x >= xCoord - bomb->range(); --x) {
            if (x >= MAP_SIZE) {
                break;
            }
            if (m_map[yCoord][x].type == TileType::Wall) {
                break;
            }
            explodedTiles.insert(std::make_pair(x, yCoord));
            if (m_map[yCoord][x].type == FragileWall) {
                break;
            }
        }

        // From middle to bottom
        for (quint16 y = yCoord + 1; y <= yCoord + bomb->range(); ++y) {
            if (y >= MAP_SIZE) {
                break;
            }
            if (m_map[y][xCoord].type == TileType::Wall) {
                break;
            }
            explodedTiles.insert(std::make_pair(xCoord, y));
            if (m_map[y][xCoord].type == FragileWall) {
                break;
            }
        }

        // From middle to top
        for (quint16 y = yCoord - 1; y >= yCoord - bomb->range(); --y) {
            if (y >= MAP_SIZE) {
                break;
            }
            if (m_map[y][xCoord].type == TileType::Wall) {
                break;
            }
            explodedTiles.insert(std::make_pair(xCoord, y));
            if (m_map[y][xCoord].type == FragileWall) {
                break;
            }
        }
    }

    return explodedTiles;
}

void Room::setTileExplosionResult(MapTile &tile_, TileList &wallsToRemove_,
                                  TileList &bonusesToRemove_, TileList &bonusesToAdd_,
                                  TileList &flames_, std::list<std::shared_ptr<Bomb> > &bombsToRemove_)
{
    flames_.push_back(tile_);

    if (tile_.bomb) {
        auto bomb = tile_.bomb;
        tile_.bomb = nullptr;
        bomb->stopCountdown();
        Player *bombOwner = bomb->owner();
        bombOwner->removeBombUnderPlayer(tile_.x, tile_.y);
        m_bombs.erase(m_bombs.find(bomb->id()));
        bombsToRemove_.push_back(bomb);
    }

    if (tile_.type == TileType::Nothing && tile_.bonus != BonusType::None) {
        bonusesToRemove_.push_back(tile_);
        tile_.bonus = BonusType::None;
    }

    if (tile_.type == TileType::FragileWall) {
        wallsToRemove_.push_back(tile_);
        tile_.type = TileType::Nothing;

        // Drop bonus from wall if it has any
        if (tile_.bonus != BonusType::None) {
            bonusesToAdd_.push_back(tile_);
        }
    }

    killPlayersOnTile(tile_);
}

QJsonArray Room::tilesListToJsonArray(const TileList &tiles_, const bool onlyCoords_)
{
    QJsonArray resultArray;
    for (const auto& tile : tiles_) {
        QJsonObject tileObject;
        tileObject.insert("x", static_cast<double>(tile.x) * m_tileWidth);
        tileObject.insert("y", static_cast<double>(tile.y) * m_tileWidth);
        if (!onlyCoords_) {
            tileObject.insert("id", tile.id);
            tileObject.insert("type", bonusToString(tile.bonus));
        }

        resultArray.append(tileObject);
    }

    return resultArray;
}

QString Room::bonusToString(const BonusType bonus_)
{
    static const std::map<BonusType, QString> bonusStringMap {
        { BonusType::None, "nothing" },
        { BonusType::PushBomb, "pushBomb" },
        { BonusType::DecreaseSpeed, "speedDec" },
        { BonusType::IncreaseSpeed, "speedInc" },
        { BonusType::DecreaseBombLimit, "bombDec" },
        { BonusType::IncreaseBombLimit, "bombInc" },
        { BonusType::IncreaseBombRange, "rangeInc" },
        { BonusType::DecreaseBombRange, "rangeDec" },
    };

    return bonusStringMap.at(bonus_);
}

void Room::onPlayerDisconnected()
{
    // Assuming that sender of this message must be an object of Player class
    auto player = dynamic_cast<Player*>(sender());

    if (!player) {
        return;
    }

    auto playerIterator = std::find(m_players.begin(), m_players.end(), player);
    if (playerIterator == m_players.end()) {
        qWarning() << "[Room] Disconnected player not present in room";
    } else {
        m_players.erase(playerIterator);
    }

    delete player;
}

void Room::onStartTimeout()
{
    // If there are no players just emit that everyone left
    if (m_players.size() == 0) {
        emit everyoneLeft(this);
        return;
    }

    // If there is one player close connection with him
    if (m_players.size() == 1) {
        auto player = m_players[0];
        player->getSocket()->close(QWebSocketProtocol::CloseCodeNormal, "Not enough players to start the game");
        emit everyoneLeft(this);
        return;
    }

    startGame();
}

void Room::onEveryoneConnected()
{
    m_startTimeout.stop();

}

void Room::onPlayerMoveRequest(Player* player_, qint32 requestId_, qint32 lastReviewedRequestId_,
                               double x_, double y_)
{
    sendReviewedRequestId(player_, requestId_);

    if (!player_->isAlive()) {
        return;
    }

    if (lastReviewedRequestId_ < player_->getLastRejectedRequestId()) {
        return;
    }

    bool accepted = isNotMovingTooFast(player_, x_, y_) && !hasCollidingTile(player_, x_, y_);


    if (!accepted) {
        sendPlayerUpdate(player_);
        player_->setLastRejectedRequestId(requestId_);
        return;
    }


    player_->setPosX(x_);
    player_->setPosY(y_);
    checkAndPickUpBonus(player_);

    auto bombsUnder = player_->getBombsUnderPlayer();

    for (const auto &bombCoords : bombsUnder) {
        if (!isColliding(x_, y_, m_map[bombCoords.y][bombCoords.x])) {
            player_->removeBombUnderPlayer(bombCoords.x, bombCoords.y);
        }
    }

    sendOtherPlayerUpdate(player_);
}

void Room::onPlayerBombRequest(Player *player_, qint32 requestId_, qint32 lastReviewedRequestId_,
                               double x_, double y_)
{
    sendReviewedRequestId(player_, requestId_);

    if (!player_->isAlive()) {
        sendBombReject(player_, x_, y_);
        return;
    }

    if (lastReviewedRequestId_ < player_->getLastRejectedRequestId()) {
        sendBombReject(player_, x_, y_);
        return;
    }

    if (amountOfPlayerBombs(player_) >= player_->getBombLimit()) {
        sendBombReject(player_, x_, y_);
        return;
    }

    auto xMapCoord = static_cast<quint16>(x_ / m_tileWidth);
    auto yMapCoord = static_cast<quint16>(y_ / m_tileWidth);

    if (m_map[yMapCoord][xMapCoord].bomb) {
        sendBombReject(player_, x_, y_);
        return;
    }

    for (auto player : m_players) {
        if (isColliding(player->getPosX(), player->getPosY(), m_map[yMapCoord][xMapCoord])) {
            player->addBombUnderPlayer(xMapCoord, yMapCoord);
        }
    }

    // TODO Why EXPLOSION_TIMEOUT doesn't work??
    auto bomb = std::make_shared<Bomb>(m_bombId++, player_, 3000);
    bomb->moveToThread(this->thread());
    bomb->setPosX(x_);
    bomb->setPosY(y_);
    bomb->setRange(player_->getBombRange());
    m_map[yMapCoord][xMapCoord].bomb = bomb;
    connect(bomb.get(), &Bomb::exploded, this, &Room::onBombExplosion);

    m_bombs[bomb->id()] = bomb;
    sendBombPlaced(player_, x_, y_);

}

// todo Check if bomb still exists?
// Todo shorten this function
void Room::onBombExplosion(Bomb *bomb_)
{
    qDebug() << "[Bomb] Bomb exploded";
    auto bomb = m_bombs.at(bomb_->id());
    std::unordered_set<qint32> explodedBombs = findExplodedBombs(bomb);
    std::set<std::pair<quint16, quint16>> explodedTiles = findExplodedTiles(explodedBombs);
    TileList wallsToRemove;
    TileList bonusesToRemove;
    TileList bonusesToAdd;
    TileList flames;
    std::list<std::shared_ptr<Bomb>> bombsToRemove;
    m_playerWasKilled = false;

    // Check every tile if something has changed
    for (auto tileCoords : explodedTiles) {
        auto [xCoord, yCoord] = tileCoords;
        MapTile &tile = m_map[yCoord][xCoord];

        setTileExplosionResult(tile, wallsToRemove, bonusesToRemove, bonusesToAdd, flames, bombsToRemove);
    }

    if (m_playerWasKilled) {
        m_lastPlace = amountOfAlivePlayers();
        checkIfGameEnd();
    }

    broadcastMapChanges(wallsToRemove, bonusesToRemove, bonusesToAdd, flames, bombsToRemove);
}
