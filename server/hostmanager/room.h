#ifndef ROOM_H
#define ROOM_H

#include <QObject>
#include <vector>
#include <player.h>

class Room : public QObject
{
    Q_OBJECT
public:
    static const quint32 MAX_PLAYERS = 4;

    explicit Room(const QStringList& expectedPlayers_, QObject *parent = nullptr);
    ~Room();

    bool addPlayer(Player *player);
    bool expectsPlayer(const QString& username);

signals:
    void everyoneLeft(Room *emptyRoom);

public slots:

private:
    std::vector<Player*> m_players;
    const QStringList m_expectedPlayers;

private slots:
    void onPlayerDisconnected();
};

#endif // ROOM_H
