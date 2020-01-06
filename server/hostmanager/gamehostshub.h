#ifndef GAMEHOSTSHUB_H
#define GAMEHOSTSHUB_H

#include <gamehost.h>
#include <overseercommunication.h>
#include <player.h>

#include <QObject>

#include <memory>
#include <set>


class GameHostsHub : public QObject
{
    Q_OBJECT
public:
    // TODO Move this to config or somewhere
    const quint32 MINIMAL_PORT {5001};
    const quint32 MAXIMAL_PORT {5125};

    explicit GameHostsHub(OverseerCommunication* overseer_, quint32 maxGames_, QObject *parent = nullptr);

signals:

public slots:

private:
    std::vector<std::unique_ptr<GameHost>> m_gameHosts;
    OverseerCommunication *m_OverseerCom {nullptr};
    std::set<quint32> m_freePorts;
    const quint32 m_maxGames;

private slots:
    void onRoomRequest(const QStringList& expectedPlayers_);
    void onAuthorizationRequired(const QString& jwtToken_, const QString& username_);
};

#endif // GAMEHOSTSHUB_H
