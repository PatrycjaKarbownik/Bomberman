#include "player.h"

Player::Player(QWebSocket *socket_, const QString &username_, QObject *parent)
    : QObject(parent),
      m_socket(socket_),
      m_username(username_)
{
    connect(m_socket, &QWebSocket::textMessageReceived, this, &Player::onReceivedTextMessage);
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

bool Player::hasPushBonus() const
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

qint32 Player::getLastRejectedRequestId() const
{
    return m_lastRejectedRequestId;
}

void Player::setLastRejectedRequestId(const qint32 &lastRejectedRequestId)
{
    m_lastRejectedRequestId = lastRejectedRequestId;
}

bool Player::isAlive() const
{
    return m_alive;
}

void Player::setAlive(bool alive)
{
    m_alive = alive;
}

quint32 Player::getSpeed() const
{
    return m_speed;
}

void Player::setSpeed(const quint32 &speed)
{
    m_speed = speed;
}

std::list<Coordinates> Player::getBombsUnderPlayer() const
{
    return m_bombsUnderPlayer;
}

bool Player::areCoordsOfBombUnderPlayer(const qint32 xPos_, const qint32 yPos_)
{
    for (const auto& bombCoords : m_bombsUnderPlayer) {
        if (bombCoords.x == xPos_ && bombCoords.y == yPos_) {
            return true;
        }
    }

    return false;
}

void Player::addBombUnderPlayer(const qint32 bombXPos_, const qint32 bombYPos_)
{
    Coordinates coordinates;
    coordinates.x = bombXPos_;
    coordinates.y = bombYPos_;

    m_bombsUnderPlayer.push_back(coordinates);
}

void Player::removeBombUnderPlayer(const qint32 bombXPos_, const qint32 bombYPos_)
{
    for (auto bombIt = m_bombsUnderPlayer.begin(); bombIt != m_bombsUnderPlayer.end(); ++bombIt) {
        if ((*bombIt).x == bombXPos_ && (*bombIt).y == bombYPos_) {
            m_bombsUnderPlayer.erase(bombIt);
            return;
        }
    }
}

qint32 Player::getBombRange() const
{
    return m_bombRange;
}

void Player::setBombRange(const qint32 &bombRange)
{
    m_bombRange = bombRange;
}

quint32 Player::getPlace() const
{
    return m_place;
}

void Player::setPlace(const quint32 &place)
{
    m_place = place;
}

void Player::onReceivedTextMessage(const QString &message_)
{
    // Remove unnecessary symbols causing parsing errors
    QString stringMessage = QString(message_).replace("\\", "").replace("\"", "");

    QStringList messageList = stringMessage.split("_");
    auto messageIter = messageList.begin();
    if (messageList.length() < 6) {
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

    double posX = (*messageIter++).toDouble(&parseResult);
    if (!parseResult) {
        return;
    }

    double posY = (*messageIter++).toDouble(&parseResult);
    if (!parseResult) {
        return;
    }


    if (requestType == "BM") {
        emit bombRequest(this, requestId, lastRequestId, posX, posY);
    }

    if (requestType == "MV") {
        emit moveRequest(this, requestId, lastRequestId, posX, posY);
    }
}
