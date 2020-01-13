#include "player.h"

Player::Player(QWebSocket *socket_, const QString &username_, QObject *parent)
    : QObject(parent),
      m_socket(socket_),
      m_username(username_)
{
    connect(m_socket, &QWebSocket::disconnected, this, &Player::disconnected);
}

Player::~Player()
{
    if (m_socket) {
        m_socket->deleteLater();
    }
}

QString Player::getUsername() const
{
    return m_username;
}

QWebSocket *Player::getSocket() const
{
    return m_socket;
}

double Player::getPosX() const
{
    return m_posX;
}

void Player::setPosX(const double &posX_)
{
    m_posX = posX_;
}

double Player::getPosY() const
{
    return m_posY;
}

void Player::setPosY(const double &posY_)
{
    m_posY = posY_;
}

quint32 Player::getBombLimit() const
{
    return m_bombLimit;
}

void Player::setBombLimit(const quint32 &bombLimit_)
{
    m_bombLimit = bombLimit_;
}

quint32 Player::getPlacedBombs() const
{
    return m_placedBombs;
}

void Player::setPlacedBombs(const quint32 &placedBombs_)
{
    m_placedBombs = placedBombs_;
}

bool Player::getPushBonus() const
{
    return m_pushBonus;
}

void Player::setPushBonus(bool pushBonus_)
{
    m_pushBonus = pushBonus_;
}

quint32 Player::getInGameId() const
{
    return m_inGameId;
}

void Player::setInGameId(const quint32 &id)
{
    m_inGameId = id;
}

quint32 Player::getLastRejectedRequestId() const
{
    return m_lastRejectedRequestId;
}

void Player::setLastRejectedRequestId(const quint32 &lastRejectedRequestId)
{
    m_lastRejectedRequestId = lastRejectedRequestId;
}

void Player::onReceivedTextMessage(const QString &message_)
{
    QStringList message = message_.split("_");
    auto messageIter = message.begin();
    if (message.length() < 6) {
        return;
    }
    if (*messageIter++ != "RQ") {
        return;
    }

    QString requestType = *messageIter++;
    bool parseResult = false;

    quint32 requestId = (*messageIter++).toUInt(&parseResult);
    if (!parseResult) {
        return;
    }

    quint32 lastRequestId = (*messageIter++).toUInt(&parseResult);
    if (!parseResult) {
        return;
    }

    quint32 posX = (*messageIter++).toUInt(&parseResult);
    if (!parseResult) {
        return;
    }

    quint32 posY = (*messageIter++).toUInt(&parseResult);
    if (!parseResult) {
        return;
    }

    if (requestType == "BM") {
        emit bombRequest(this, requestId, lastRequestId, posX, posY);
    }

    if (requestType != "MV") {
        emit moveRequest(this, requestId, lastRequestId, posX, posY);
    }
}
