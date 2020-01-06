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
    Room *newRoom = new Room(expectedPlayerUsernames_, this);
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

void GameHost::onAuthorizationFailed(const QString &jwtToken_, const QString &username_)
{

}

void GameHost::onAuthorizationSucceed(const QString &jwtToken_, const QString &username_)
{

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

}
