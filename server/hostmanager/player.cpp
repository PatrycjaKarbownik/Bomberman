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
