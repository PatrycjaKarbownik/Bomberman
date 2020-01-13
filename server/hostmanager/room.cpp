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
    message.insert("messageType", "playerInfo");

    QJsonArray content;
    for (const Player* player : m_players) {
        QJsonObject playerObject;
        playerObject.insert("username", player->getUsername());
        playerObject.insert("inGameId", static_cast<qint64>(player->getInGameId()));
        playerObject.insert("x", player->getPosX());
        playerObject.insert("y", player->getPosY());
        content.append(playerObject);
    }

    message.insert("content", content);
    QJsonDocument doc(message);

    for (const Player* player : m_players) {
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
        player->setBombLimit(1);
        player->setPlacedBombs(0);
        player->setPushBonus(false);
        player->setPosX(*posXIter++);
        player->setPosY(*posYIter++);
    }
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

void Room::onPlayerMoveRequest(Player* player_, quint32 requestId_, quint32 lastReviewedRequestId_,
                               double x_, double y_)
{
    if (lastReviewedRequestId_ <= player_->getLastRejectedRequestId()) {
        return;
    }
}

void Room::onPlayerBombRequest(Player *player_, quint32 requestId_, quint32 lastReviewedRequestId_,
                               double x_, double y_)
{

}
