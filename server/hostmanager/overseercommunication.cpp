#include "overseercommunication.h"

#include <QJsonArray>

OverseerCommunication::OverseerCommunication(const quint16 overseerPort_, QObject *parent)
    : QObject(parent),
      m_overseerPort(overseerPort_)
{
    m_socket.connectToHost("localhost", overseerPort_, QTcpSocket::ReadWrite);

    // We can block process while waiting for connection because without it
    // application does not have much to do anyway
    m_socket.waitForConnected(5000);

    if (m_socket.state() != QTcpSocket::ConnectedState) {
        qCritical() << "Socket could not connect!";
        return;
    }

    connect(&m_socket, &QTcpSocket::readyRead, this, &OverseerCommunication::onReadyRead);
}

bool OverseerCommunication::isCommunicationWorking() const
{
    return m_socket.state() != QTcpSocket::ConnectedState;
}

// Todo remove repetitive fragments of send to other function
void OverseerCommunication::sendRoomReadyResponse(const QStringList &expectedPlayers_, quint16 port_)
{
    QJsonObject response;
    response.insert("messageType", "roomReady");

    QJsonObject content;
    content.insert("port", port_);

    QJsonArray expectedPlayersArray;
    for (const QString& username : expectedPlayers_) {
        expectedPlayersArray.push_back(username);
    }
    content.insert("expectedPlayers", expectedPlayersArray);
    response.insert("content", content);

    QJsonDocument doc(response);
    m_socket.write(doc.toJson());
}

void OverseerCommunication::sendAuthorizationRequest(const QString &jwtToken_, const QString &username_)
{
    QJsonObject request;
    request.insert("messageType", "authorization");

    QJsonObject content;
    content.insert("jwtToken", jwtToken_);
    content.insert("username", username_);
    request.insert("content", content);

    QJsonDocument doc(request);
    m_socket.write(doc.toJson());
}

void OverseerCommunication::onReadyRead()
{
    while (m_socket.canReadLine()) {
        QByteArray message = m_socket.readLine();
        qDebug() << "Received line " << message;

        QJsonDocument doc = QJsonDocument::fromJson(message);
        if (doc.isEmpty()) {
            continue;
        }

        QJsonValue messageType = doc["messageType"];
        QJsonValue content = doc["content"];
        if (!messageType.isString() || !content.isObject()) {
            continue;
        }

        if (messageType.toString() == "authorization") {
            handleAuthorizationMessage(content.toObject());
        }

        if (messageType.toString() == "roomRequest") {
            handleRoomRequestMessage(content.toObject());
        }

    }
}

void OverseerCommunication::handleAuthorizationMessage(const QJsonObject &content_)
{
    if (!content_["authorized"].isBool()) {
        return;
    }

    QString jwtToken = content_["jwtToken"].toString();
    QString username = content_["username"].toString();
    bool authorized = content_["authorized"].toBool();

    if (jwtToken.isEmpty() || username.isEmpty()) {
        return;
    }

    if(authorized) {
        emit authorizationSucceed(jwtToken, username);
    } else {
        emit authorizationFailed(jwtToken, username);
    }
}

void OverseerCommunication::handleRoomRequestMessage(const QJsonObject &content_)
{
    QJsonArray expectedPlayers = content_["expectedPlayers"].toArray();
    if (expectedPlayers.isEmpty()) {
        return;
    }

    QStringList expectedPlayersList;
    for (QJsonValue username : expectedPlayers) {
        if (!username.isString()) {
            return;
        }
        expectedPlayersList.push_back(username.toString());
    }

    emit roomRequest(expectedPlayersList);
}
