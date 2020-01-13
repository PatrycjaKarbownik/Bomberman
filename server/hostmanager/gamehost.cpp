#include "gamehost.h"

#include <QJsonDocument>
#include <QTimer>

GameHost::GameHost(const quint16 port_)
    : QObject(nullptr),
      m_server(QString("GameHost%1").arg(port_), QWebSocketServer::NonSecureMode, this),
      m_port(port_)
{
    m_server.listen(QHostAddress::Any, port_);
    connect(&m_server, &QWebSocketServer::newConnection, this, &GameHost::onIncomingConnection);

    if (m_server.isListening()) {
        qInfo() << QString("[Gamehost] New gamehost listening on port %1").arg(m_port);
    } else {
        qCritical() << QString("[Gamehost] Gamehost failed to listen on port %1").arg(m_port);
    }
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
        disconnect(player->getSocket(), &QWebSocket::disconnected, this, &GameHost::onSocketDisconnect);
        return;
    }

    // If player is not expected on any of rooms
    player->getSocket()->close(QWebSocketProtocol::CloseCodeNormal, "Player not expected in any of rooms");
}

std::tuple<QJsonValue, QJsonValue> GameHost::parseAuthorizationMessage(const QString &message_)
{
    QJsonDocument messageDoc = QJsonDocument::fromJson(message_.toUtf8());

    if (messageDoc.isEmpty()) {
        qWarning() << "[Parsing JSON message] Parsing of message failed";
        return { QJsonValue(QJsonValue::Undefined), QJsonValue(QJsonValue::Undefined) };
    }

    QJsonValue messageType = messageDoc["messageType"];
    if (!messageType.isString()) {
        qWarning() << "[Parsing JSON message] Received message does not contain \"messageType\" field "
                      "or it has wrong type (not string)";
        return { QJsonValue(QJsonValue::Undefined), QJsonValue(QJsonValue::Undefined) };
    }

    if (messageType.toString() != "authorization") {
        qWarning() << "[Parsing JSON message] Received message was not of type authorization";
        return { QJsonValue(QJsonValue::Undefined), QJsonValue(QJsonValue::Undefined) };
    }

    QJsonValue credentialsObject = messageDoc["content"];
    if (!credentialsObject.isObject()) {
        qWarning() << "[Parsing JSON message] Received message does not contain \"content\" field "
                      "or it has wrong type (not JSON object)";
        return { QJsonValue(QJsonValue::Undefined), QJsonValue(QJsonValue::Undefined) };
    }

    QJsonValue jwtToken = credentialsObject["jwtToken"];
    QJsonValue username = credentialsObject["username"];
    if (!jwtToken.isString() || !username.isString()) {
        qWarning() << "[Parsing JSON message] Received message does not contain \"jwtToken\" field or \"username\" "
                      "field or they have wrong type (not JSON object)";
        return { QJsonValue(QJsonValue::Undefined), QJsonValue(QJsonValue::Undefined) };
    }

    return {jwtToken, username};
}

void GameHost::onIncomingConnection()
{
    qDebug() << "[Connection] Incoming connection";
    while(m_server.hasPendingConnections()) {
        QWebSocket *pendingConnection = m_server.nextPendingConnection();
        qInfo() << "[Connection] Somebody has connected to gamehost with port " << m_port;
        connect(pendingConnection, &QWebSocket::textMessageReceived, this, &GameHost::onReceivedTextMessage);
        connect(pendingConnection, &QWebSocket::disconnected, this, &GameHost::onSocketDisconnect);

        // Until socket is not sending credentials we are treating it as an anonymous socket
        // TODO Add timer to timeout socket after some time
        m_anonymousSockets.push_back(pendingConnection);
    }
}

void GameHost::onReceivedTextMessage(const QString &message_)
{
    qDebug() << "[Websocket] Received message " << message_;

    // At this stage of communication we expect only authorization message
    auto [jwtToken, username] = parseAuthorizationMessage(message_);
    if (jwtToken.isUndefined() || username.isUndefined()) {
        qWarning() << "[Websocket] Credentials are undefined";
        return;
    }

    QWebSocket *socket = dynamic_cast<QWebSocket*>(sender());
    if (!socket) {
        qWarning() << "[Websocket] No webSocket associated with sent message";
        return;
    }

    Player *newUnauthorizedPlayer = new Player(socket, username.toString());

    // Remove socket from anonymous sockets as player just introduced itself
    auto socketIt = std::find(m_anonymousSockets.begin(), m_anonymousSockets.end(), socket);
    if (socketIt == m_anonymousSockets.end()) {
        qWarning() << "[Websocket] Socket who wanted authorization is not on list of anonymous sockets";
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

void GameHost::onSocketDisconnect()
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
