#ifndef GAMEHOSTSHUB_H
#define GAMEHOSTSHUB_H

#include <gamehost.h>
#include <overseercommunication.h>
#include <player.h>

#include <QObject>

#include <memory>
#include <set>

/**
 * @brief The GameHostsHub class responsible for managing several game hosts
 *
 * GameHostsHub is responsible for distributing work between game hosts and forwarding messages between game hosts
 * and overseer. When overseer wants to create a new room GameHostsHub first checks if any of exisiting game hosts
 * has no more than maximum amount of games already opened. He can assign creating room to existing game host or
 * create new one.
 */
class GameHostsHub : public QObject
{
    Q_OBJECT
public:
    // TODO Move this to config or somewhere
    const quint32 MINIMAL_PORT {5001};
    const quint32 MAXIMAL_PORT {5125};

    /**
     * @brief GameHostsHub
     * @param overseer_: pointer to an existing and working OverseerCommunication instance
     * @param maxGames_: maximum number of games per GameHost
     * @param parent
     */
    explicit GameHostsHub(OverseerCommunication* overseer_, quint32 maxGames_, QObject *parent = nullptr);

signals:

public slots:

private:
    std::unique_ptr<GameHost> createGameHost(quint32 port);

    std::vector<std::unique_ptr<GameHost>> m_gameHosts;
    OverseerCommunication *m_OverseerCom {nullptr};
    std::set<quint32> m_freePorts;
    const quint32 m_maxGames;

private slots:
    /**
     * @brief onRoomRequest: Looks for a gamehost to host a new game, if none is found then new is created
     * @param expectedPlayers_: List of usernames of expected players
     */
    void onRoomRequest(const QStringList& expectedPlayers_);

    /**
     * @brief onAuthorizationRequired: Sends to overseer an information that authorization of player is needed
     * @param jwtToken_: access token of a player
     * @param username_: username of a player
     */
    void onAuthorizationRequired(const QString& jwtToken_, const QString& username_);
};

#endif // GAMEHOSTSHUB_H
