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

void Room::broadcastMapChanges(std::list<MapTile> wallsToRemove, std::list<MapTile> bonusesToRemove,
                               std::list<std::shared_ptr<Bomb> > bombsToRemove)
{
    QJsonObject message;
    message.insert("messageType", "updateMap");

    QJsonArray bonusesRemovedArray = tilesListToJsonArray(bonusesToRemove);
    QJsonArray wallsRemovedArray = tilesListToJsonArray(wallsToRemove);
    QJsonArray bombsRemovedArray;

    for (const auto& bomb : bombsToRemove) {
        QJsonObject removedBomb;
        removedBomb.insert("x", bomb->posX());
        removedBomb.insert("y", bomb->posY());

        bombsRemovedArray.append(removedBomb);
    }

    message.insert("removedFragileWalls", wallsRemovedArray);
    message.insert("removedBonuses", bonusesRemovedArray);
    message.insert("removedBombs", bombsRemovedArray);
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
        player->setPushBonus(false);
        player->setAlive(true);
        player->setLastRejectedRequestId(-1);
        player->setPosX(*posXIter++);
        player->setPosY(*posYIter++);
    }
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
            // Send information to player about its death
            sendPlayerUpdate(player);

            // Inform other players about death
            sendOtherPlayerUpdate(player);
        }
    }
}

// TODO Do something about these casts
std::unordered_set<qint32> Room::findBombsInExplosionRange(quint16 bombX_, quint16 bombY_, qint32 bombRange_)
{
    std::unordered_set<qint32> explodedBombs;
    for (qint32 x = static_cast<qint32>(bombX_) - bombRange_; x <= static_cast<qint32>(bombX_) + bombRange_; ++x) {
        if (x < 0 || static_cast<qint32>(bombX_) == x || x >= MAP_SIZE) {
            continue;
        }
        if (m_map[bombY_][x].bomb) {
            explodedBombs.insert(m_map[bombY_][x].id);
        }
    }

    for (qint32 y = static_cast<qint32>(bombY_) - bombRange_; y <= static_cast<qint32>(bombY_) + bombRange_; ++y) {
        if (y < 0 || static_cast<qint32>(bombY_) == y || y >= MAP_SIZE) {
            continue;
        }
        if (m_map[y][bombX_].bomb) {
            explodedBombs.insert(m_map[y][bombX_].id);
        }
    }

    return explodedBombs;
}

std::unordered_set<qint32> Room::findExplodedBombs(std::shared_ptr<Bomb> firstExplodedBomb_)
{
    // We are creating two collections: explodedBombs are bombs that their explosion is already calculated,
    // bombsToExplode are just about to be calculated
    std::unordered_set<qint32> explodedBombs;
    std::unordered_set<qint32> bombsToExplode;

    // bomb_ is first bomb which is about to explode
    bombsToExplode.insert(firstExplodedBomb_->id());

    while(bombsToExplode.size() > 0) {
        // Pop first element
        qint32 id = *(bombsToExplode.begin());
        bombsToExplode.erase(bombsToExplode.begin());
        explodedBombs.insert(id);

        // Find bombs affected by explosion
        auto bomb = m_bombs[id];
        auto xCoord = static_cast<quint16>(bomb->posX() / m_tileWidth);
        auto yCoord = static_cast<quint16>(bomb->posY() / m_tileWidth);
        auto bombsInRange = findBombsInExplosionRange(xCoord, yCoord, bomb->range());

        // Check if bombs are already not in one of collections
        for (qint32 bombId : bombsInRange) {
            if (explodedBombs.find(bombId) != explodedBombs.end() &&
                    bombsToExplode.find(bombId) != bombsToExplode.end()) {
                bombsToExplode.insert(bombId);
            }
        }
    }

    return explodedBombs;
}

// TODO reduce code duplication and casts
std::set<std::pair<quint16, quint16> > Room::findExplodedTiles(const std::unordered_set<qint32> &explodedBombs)
{
    std::set<std::pair<quint16, quint16>> explodedTiles;

    for (const qint32 bombId : explodedBombs) {
        auto bomb = m_bombs[bombId];
        auto xCoord = static_cast<quint16>(bomb->posX() / m_tileWidth);
        auto yCoord = static_cast<quint16>(bomb->posY() / m_tileWidth);

        for (qint32 x = static_cast<qint32>(xCoord) - bomb->range(); x <= static_cast<qint32>(xCoord) + bomb->range(); ++x) {
            if (x < 0 || static_cast<qint32>(xCoord) == x || x >= MAP_SIZE) {
                continue;
            }
            explodedTiles.insert(std::make_pair(x, yCoord));
        }

        for (qint32 y = static_cast<qint32>(yCoord) - bomb->range(); y <= static_cast<qint32>(yCoord) + bomb->range(); ++y) {
            if (y < 0 || static_cast<qint32>(yCoord) == y || y >= MAP_SIZE) {
                continue;
            }
            explodedTiles.insert(std::make_pair(xCoord, y));
        }
    }

    return explodedTiles;
}

QJsonArray Room::tilesListToJsonArray(const std::list<MapTile> &tiles)
{
    QJsonArray resultArray;
    for (const auto& tile : tiles) {
        QJsonObject removedTile;
        removedTile.insert("x", static_cast<double>(tile.x) * m_tileWidth);
        removedTile.insert("y", static_cast<double>(tile.y) * m_tileWidth);

        resultArray.append(removedTile);
    }

    return resultArray;
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
        return;
    }

    if (lastReviewedRequestId_ < player_->getLastRejectedRequestId()) {
        return;
    }

    auto xMapCoord = static_cast<quint16>(x_ / m_tileWidth);
    auto yMapCoord = static_cast<quint16>(y_ / m_tileWidth);

    if (m_map[yMapCoord][xMapCoord].bomb) {
        sendBombReject(player_, x_, y_);
        return;
    }

    player_->addBombUnderPlayer(xMapCoord, yMapCoord);
    auto bomb = std::make_shared<Bomb>(new Bomb(m_bombId++, player_, EXPLOSION_TIMEOUT));
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
    std::list<MapTile> wallsToRemove;
    std::list<MapTile> bonusesToRemove;
    std::list<std::shared_ptr<Bomb>> bombsToRemove;

    // Check every tile if something has changed
    for (auto tileCoords : explodedTiles) {
        auto [xCoord, yCoord] = tileCoords;
        MapTile &tile = m_map[yCoord][xCoord];

        if (tile.type == TileType::Nothing && !tile.bomb) {
            continue;
        }

        if (tile.bomb) {
            auto bomb = tile.bomb;
            tile.bomb = nullptr;
            bomb->stopCountdown();
            Player *bombOwner = bomb->owner();
            bombOwner->removeBombUnderPlayer(xCoord, yCoord);
            m_bombs.erase(m_bombs.find(bomb->id()));
        }

        if (tile.type == TileType::Nothing && tile.bonus != BonusType::None) {
            bonusesToRemove.push_back(tile);
            tile.bonus = BonusType::None;
        }

        if (tile.type == TileType::FragileWall) {
            wallsToRemove.push_back(tile);
            tile.type = TileType::Nothing;
            continue;
        }

        killPlayersOnTile(tile);
    }

    broadcastMapChanges(wallsToRemove, bonusesToRemove, bombsToRemove);
}
