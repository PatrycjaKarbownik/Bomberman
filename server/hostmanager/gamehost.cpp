#include "gamehost.h"

#include <QJsonDocument>
#include <QTimer>

GameHost::GameHost(const quint16 port_)
    : QObject(nullptr),
      m_server(QString("GameHost%1").arg(port_), QWebSocketServer::NonSecureMode, this),
      m_port(port_)
{
    m_server.listen(QHostAddress::Any, port_);
}

void GameHost::createRoom(const QStringList &expectedPlayerUsernames_)
{
    Room *newRoom = new Room(expectedPlayerUsernames_);
    m_rooms.push_back(newRoom);
}

quint64 GameHost::numberOfRooms() const
{
    return m_rooms.size();
}

quint16 GameHost::port() const
{
    return m_port;
}

// TODO Remove code duplication
void GameHost::onAuthorizationFailed(const QString &jwtToken_, const QString &username_)
{
    auto mapKey = std::make_pair(jwtToken_, username_);
    auto playerIt = m_unauthorizedPlayers.find(mapKey);
    if (playerIt == m_unauthorizedPlayers.end()) {
        return;
    }

    Player* player = playerIt->second;
    player->getSocket()->close(QWebSocketProtocol::CloseCodeNormal, "Authorization failed");
}

void GameHost::onAuthorizationSucceed(const QString &jwtToken_, const QString &username_)
{
    auto mapKey = std::make_pair(jwtToken_, username_);
    auto playerIt = m_unauthorizedPlayers.find(mapKey);
    if (playerIt == m_unauthorizedPlayers.end()) {
        return;
    }

    Player* player = playerIt->second;
    for (auto room : m_rooms) {
        if (!room->expectsPlayer(username_)) {
            continue;
        }
        room->addPlayer(player);
        disconnect(player->getSocket(), &QWebSocket::textMessageReceived, this, &GameHost::onReceivedTextMessage);
        disconnect(player->getSocket(), &QWebSocket::disconnected, this, &GameHost::onSocketDisckonnect);
        return;
    }

    // If player is not expected on any of rooms
    player->getSocket()->close(QWebSocketProtocol::CloseCodeNormal, "Player not expected in any of rooms");
}

void GameHost::onIncomingConnection()
{
    while(m_server.hasPendingConnections()) {
        QWebSocket *pendingConnection = m_server.nextPendingConnection();
        connect(pendingConnection, &QWebSocket::textMessageReceived, this, &GameHost::onReceivedTextMessage);
        connect(pendingConnection, &QWebSocket::disconnected, this, &GameHost::onSocketDisckonnect);
        // TODO Add timer to timeout socket after some time
    }
}

// TODO Shorten this function
void GameHost::onReceivedTextMessage(const QString &message_)
{
    qDebug() << "Received message " << message_;
    QJsonDocument messageDoc = QJsonDocument::fromJson(message_.toUtf8());

    if (messageDoc.isEmpty()) {
        qWarning() << "Parsing of message failed";
        return;
    }

    QJsonValue messageType = messageDoc["messageType"];
    if (!messageType.isString()) {
        qWarning() << "Received message does not contain \"messageType\" field or it has wrong type (not string)";
        return;
    }

    if (messageType.toString() != "authorization") {
        qWarning() << "Received message was not of type authorization";
        return;
    }

    QJsonValue credentialsObject = messageDoc["content"];
    if (!credentialsObject.isObject()) {
        qWarning() << "Received message does not contain \"content\" field or it has wrong type (not JSON object)";
        return;
    }

    QJsonValue jwtToken = credentialsObject["jwtToken"];
    QJsonValue username = credentialsObject["username"];
    if (!jwtToken.isString() || !username.isString()) {
        qWarning() << "Received message does not contain \"jwtToken\" field or \"username\" field "
                   << "or they have wrong type (not JSON object)";
        return;
    }

    QWebSocket *socket = dynamic_cast<QWebSocket*>(sender());
    if (!socket) {
        return;
    }

    Player *newUnauthorizedPlayer = new Player(socket, username.toString());

    // Remove socket from anonymous sockets as player just introduced itself
    auto socketIt = std::find(m_anonymousSockets.begin(), m_anonymousSockets.end(), socket);
    if (socketIt == m_anonymousSockets.end()) {
        return;
    }
    m_anonymousSockets.erase(socketIt);

    // Put Player in m_unauthorizedPlayers untill authorization response from overseer comes up
    auto mapKey = std::make_pair(jwtToken.toString(), username.toString());
    // If there already is unauthorized player with given mapKey then remove him
    if (m_unauthorizedPlayers.find(mapKey) != m_unauthorizedPlayers.end()) {
        m_unauthorizedPlayers[mapKey]->getSocket()->close();
        m_unauthorizedPlayers[mapKey]->deleteLater();
    }

    m_unauthorizedPlayers[mapKey] = newUnauthorizedPlayer;
    emit authorizationRequired(jwtToken.toString(), username.toString());
}

void GameHost::onLeftRoom(Room *emptyRoom_)
{
    if (!emptyRoom_) {
        return;
    }

    auto roomIterator = std::find(m_rooms.begin(), m_rooms.end(), emptyRoom_);
    if (roomIterator == m_rooms.end()) {
        return;
    }

    m_rooms.erase(roomIterator);
    emptyRoom_->deleteLater();
}

void GameHost::onSocketDisckonnect()
{
    auto *socket = dynamic_cast<QWebSocket*>(sender());
    // Check if socket was awaiting
    for (auto i = m_anonymousSockets.begin(); i != m_anonymousSockets.end(); ++i) {
        if ((*i) == socket) {
            m_anonymousSockets.erase(i);
            socket->deleteLater();
            return;
        }
    }

    // Check if one of unauthorized players didn't get bored
    for (auto i = m_unauthorizedPlayers.begin(); i != m_unauthorizedPlayers.end(); ++i) {
        if ((i->second)->getSocket() == socket) {
            m_unauthorizedPlayers.erase(i);
            socket->deleteLater();
            return;
        }
    }

    // Delete this socket anyway just to be sure
    socket->deleteLater();
}
