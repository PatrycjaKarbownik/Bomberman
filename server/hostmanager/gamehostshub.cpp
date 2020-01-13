#include "gamehostshub.h"

#include <QDebug>
#include <QThread>

GameHostsHub::GameHostsHub(OverseerCommunication *overseer_, quint32 maxGames_, QObject *parent)
    : QObject(parent),
      m_OverseerCom(overseer_),
      m_maxGames(maxGames_)
{
    // TODO Handle overseer nullptr?
    // Set available ports for client-server communication based on minimal and maximal values
    for (quint32 i = MINIMAL_PORT; i <= MAXIMAL_PORT; ++i) {
        m_freePorts.insert(i);
    }

    connect(overseer_, &OverseerCommunication::roomRequest, this, &GameHostsHub::onRoomRequest);

}

std::unique_ptr<GameHost> GameHostsHub::createGameHost(quint32 port)
{
    std::unique_ptr newGameHost = std::make_unique<GameHost>(port);

    // Create new thread for gameHost
    // NOTE We do not need to keep a pointer for QThread as we can access it anytime by QObject::thread()
    QThread *newThread = new QThread;
    newGameHost->moveToThread(newThread);

    connect(m_OverseerCom, &OverseerCommunication::authorizationFailed,
            newGameHost.get(), &GameHost::onAuthorizationFailed);

    connect(m_OverseerCom, &OverseerCommunication::authorizationSucceed,
            newGameHost.get(), &GameHost::onAuthorizationSucceed);

    connect(newGameHost.get(), &GameHost::authorizationRequired,
            this, &GameHostsHub::onAuthorizationRequired);

    newThread->start();
    return newGameHost;
}

void GameHostsHub::onRoomRequest(const QStringList &expectedPlayers_)
{
    bool gameHostChosen = false;
    for (auto& gameHost : m_gameHosts) {
        if (gameHost->numberOfRooms() >= m_maxGames) {
            continue;
        }

        gameHost->createRoom(expectedPlayers_);
        m_OverseerCom->sendRoomReadyResponse(expectedPlayers_, gameHost->port());
        gameHostChosen = true;
        break;
    }

    if (gameHostChosen) {
        return;
    }

    if (m_freePorts.size() == 0) {
        qWarning() << "[Creating new gamehost] There was no place for another GameHost!";
        // TODO Add some handling like message to overseer
        return;
    }
    // Take first port from m_freePorts set and then remove it from this set
    quint32 freePort = *(m_freePorts.begin());
    m_freePorts.erase(m_freePorts.begin());

    auto newGameHost = createGameHost(freePort);

    newGameHost->createRoom(expectedPlayers_);
    m_OverseerCom->sendRoomReadyResponse(expectedPlayers_, newGameHost->port());
    m_gameHosts.push_back(std::move(newGameHost));
}

void GameHostsHub::onAuthorizationRequired(const QString &jwtToken_, const QString &username_)
{
    m_OverseerCom->sendAuthorizationRequest(jwtToken_, username_);
}
