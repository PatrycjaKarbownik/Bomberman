#ifndef GAMEHOSTINSTANCE_H
#define GAMEHOSTINSTANCE_H

#include <room.h>

#include <QObject>
#include <QDebug>
#include <QWebSocketServer>

#include <map>

// TODO Implement deleting of GameHost after rooms are closed? Or maybe keep it anyway?
class GameHost : public QObject
{
    Q_OBJECT
public:
    // In order to move whole QObject to different thread it mustn't have parent
    explicit GameHost(const quint16 port_);
    void createRoom(const QStringList& expectedPlayerUsernames_);
    quint64 numberOfRooms() const;
    quint16 port() const;

signals:
    /**
     * @brief authorizationRequired: signals that somebody tried to join game
     * @param jwtToken: JWT Token which is an authorization method used by Overseer
     * @param username: Username of user
     *
     * Whenever an user tries to connect to the game GameHost first waits for credentials
     * which are jwt token and username. Then this signal is fired and
     */
    void authorizationRequired(const QString& jwtToken, const QString& username);

public slots:
    /**
     * @brief authorizationFailed: Removes player who waits for authorization with given credentials if is present
     * @param jwtToken
     * @param username
     */
    void onAuthorizationFailed(const QString& jwtToken_, const QString& username_);

    /**
     * @brief authorizationFailed: Adds player with given credentials to room he is assigned to
     * @param jwtToken
     * @param username
     */
    void onAuthorizationSucceed(const QString& jwtToken_, const QString& username_);

private:    
    // Map of players that awaits for authorization
    // Key is a pair of jwt token and player's username
    std::map<std::pair<QString, QString>, Player*> m_unauthorizedPlayers;
    // Vectors of sockets that haven't send credentials yet
    std::vector<QWebSocket*> m_anonymousSockets;
    std::vector<Room*> m_rooms;
    QWebSocketServer m_server;
    const quint16 m_port;

private slots:
    /**
     * @brief onIncomingConnection
     */
    void onIncomingConnection();

    /**
     * @brief onReceivedTextMessage: handles received message
     * @param message_: received message from socket
     *
     * Gamehost generally communicates with socket only for authorization - therefore any other messages
     * are regarder as not intended or just wrong and there is only expected json format for credentials
     */
    void onReceivedTextMessage(const QString &message_);

    /**
     * @brief onLeftRoom
     * @param emptyRoom_
     */
    void onLeftRoom(Room *emptyRoom_);

    /**
     * @brief onSocketDisckonnect
     */
    void onSocketDisckonnect();

};

#endif // GAMEHOSTINSTANCE_H
