#ifndef ROOM_H
#define ROOM_H

#include <player.h>
#include <gamemap.h>

#include <QTimer>

#include <vector>

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
    static const quint32 START_TIMEOUT = 30000; // 30 s of waiting for players to connect
    static const quint32 MAP_SIZE = 11;

    explicit Room(const QStringList& expectedPlayers_, QObject *parent = nullptr);
    ~Room();

    /**
     * @brief addPlayer: adds player to a room
     * @param player: pointer to a Player object
     * @return True if players was added, otherwise false
     */
    bool addPlayer(Player *player_);

    /**
     * @brief expectsPlayer: checks if room is expecting given player
     * @param username: username of player
     * @return true if this room is awaiting player with given username, otherwise false
     */
    bool expectsPlayer(const QString& username_);

signals:
    /**
     * @brief everyoneLeft: emited when there was at least one player in the room and he left
     * @param emptyRoom: room which is emiting signal
     */
    void everyoneLeft(Room *emptyRoom);

public slots:

private:
    void startGame();
    void sendHelloMessage(Player *player_);
    void broadcastMap(const QJsonArray &map_);

    GameMap m_map;
    // Waiting for players to start the game
    QTimer m_startTimeout;
    QTimer m_countdownTimer;
    std::vector<Player*> m_players;
    const QStringList m_expectedPlayers;

private slots:
    void onPlayerDisconnected();
    void onStartTimeout();
    void onEveryoneConnected();
};

#endif // ROOM_H
