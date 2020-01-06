#include "room.h"

#include <QDebug>

Room::Room(const QStringList &expectedPlayers_, QObject *parent)
    : QObject(parent),
      m_expectedPlayers(expectedPlayers_)
{

}

Room::~Room()
{
    for (auto player : m_players) {
        if (player) {
            player->deleteLater();
        }
    }
}

bool Room::addPlayer(Player *player)
{
    if (!player) {
        qWarning() << "Room received nullptr instead of player";
        return false;
    }
    if (m_players.size() >= MAX_PLAYERS) {
        qWarning() << "Player " << player->getUsername() << " tried to enter full room";
        return false;
    }

    m_players.push_back(player);
    connect(player, &Player::disconnected, this, &Room::onPlayerDisconnected);
    return true;
}

bool Room::expectsPlayer(const QString &username)
{
    return m_expectedPlayers.contains(username);
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
