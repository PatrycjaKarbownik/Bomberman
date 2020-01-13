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
        content.append(playerObject);
    }

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
            if (mapTile.type == TileType::Nothing && !mapTile.hasBomb) {
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
    if (m_players.size() == 0) {
        emit everyoneLeft(this);
        return;
    }

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

    for (auto bombCoords : player_->getBombsUnderPlayer()) {
        if (isColliding(x_, y_, m_map[bombCoords.y][bombCoords.x])) {
            player_->removeBombUnderPlayer(bombCoords.x, bombCoords.y);
        }
    }

    sendOtherPlayerUpdate(player_);
}

void Room::onPlayerBombRequest(Player *player_, qint32 requestId_, qint32 lastReviewedRequestId_,
                               double x_, double y_)
{
    if (!player_->isAlive()) {
        return;
    }
}
