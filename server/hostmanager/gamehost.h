#ifndef GAMEHOSTINSTANCE_H
#define GAMEHOSTINSTANCE_H

#include <room.h>

#include <QObject>
#include <QDebug>
#include <QWebSocketServer>

#include <map>

// TODO Implement deleting of GameHost after rooms are closed? Or maybe keep it anyway?
/**
 * @brief The GameHost class
 *
 * Class responsible for hosting games in several rooms. Every object of Room class is a separate game
 * for up to 4 players. Every GameHost has it's own porn on which players are connecting. Every rooms is a separate
 * entity but every connection of every player in every room is held by QWebSocketServer of GameHost.
 *
 * When GameHost receives new websocket (connection) it puts this new websocket into m_anonymousSockets so it
 * won't be lost. When this websocket sends an authorization message GameHost reads credentials (jwtToken and username)
 * and emits a signal that he needs an authorization. There is also created a class Player which gets to hold a scoket
 * and whole Player class's object now awaits in m_unauthorizedPlayers. When authorization arrives (on one of its slots)
 * it can be either failed one or succesful one. If authorization failed socket is disconnected and cleaned up. If it
 * succeeded gamehost looks for a room that expects a player with given username and when room is found
 * socket is put there.
 */
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
     * @brief onIncomingConnection: connects socket's signals to gamehost's slots and puts it in m_anonymousSockets
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
     * @brief onLeftRoom: Deletes an room when it becomes empty
     * @param emptyRoom_
     */
    void onLeftRoom(Room *emptyRoom_);

    /**
     * @brief onSocketDisckonnect: Deletes socket when it is no longer needed
     */
    void onSocketDisckonnect();

};

#endif // GAMEHOSTINSTANCE_H
