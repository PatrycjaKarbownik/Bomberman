#ifndef ROOM_H
#define ROOM_H

#include <QObject>
#include <vector>
#include <player.h>

/**
 * @brief The Room class
 *
 * Room is a special container for players and it manages their game. It keeps track of time left, checks for
 * collisions, explosions etc.
 */
class Room : public QObject
{
    Q_OBJECT
public:
    static const quint32 MAX_PLAYERS = 4;

    explicit Room(const QStringList& expectedPlayers_, QObject *parent = nullptr);
    ~Room();

    /**
     * @brief addPlayer: adds player to a room
     * @param player: pointer to a Player object
     * @return True if players was added, otherwise false
     */
    bool addPlayer(Player *player);

    /**
     * @brief expectsPlayer: checks if room is expecting given player
     * @param username: username of player
     * @return true if this room is awaiting player with given username, otherwise false
     */
    bool expectsPlayer(const QString& username);

signals:
    /**
     * @brief everyoneLeft: emited when there was at least one player in the room and he left
     * @param emptyRoom: room which is emiting signal
     */
    void everyoneLeft(Room *emptyRoom);

public slots:

private:
    std::vector<Player*> m_players;
    const QStringList m_expectedPlayers;

private slots:
    void onPlayerDisconnected();
};

#endif // ROOM_H
