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
        qWarning() << "Room received nullptr instead of player";
        return false;
    }
    if (m_players.size() >= MAX_PLAYERS) {
        qWarning() << "Player " << player_->getUsername() << " tried to enter full room";
        return false;
    }

    m_players.push_back(player_);
    connect(player_, &Player::disconnected, this, &Room::onPlayerDisconnected);
    // TODO Remove/change welcome message
    QString expectedPlayers;
    for (const QString& username : m_expectedPlayers) {
        expectedPlayers.append(username);
    }
    sendHelloMessage(player_);

    if (m_expectedPlayers.length() == static_cast<int>(m_players.size())) {
        onStartTimeout();
    }
    return true;
}

bool Room::expectsPlayer(const QString &username_)
{
    return m_expectedPlayers.contains(username_);
}

void Room::startGame()
{
    m_map.generate(MAP_SIZE);
    broadcastMap(m_map.dumpMap());
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
    message.insert("messageType", "mapinfo");
    message.insert("content", map_);

    QJsonDocument doc(message);

    for (const Player* player : m_players) {
        player->getSocket()->sendTextMessage(doc.toJson(QJsonDocument::Compact));
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
        qWarning() << "Disconnected player not present in room";
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
