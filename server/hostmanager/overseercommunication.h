#ifndef OVERSEERCOMMUNICATION_H
#define OVERSEERCOMMUNICATION_H

#include <QObject>
#include <QTcpSocket>
#include <QHostAddress>
#include <QTimer>
#include <QJsonObject>
#include <QJsonDocument>

/**
 * @brief The OverseerCommunication class keeps communication with overseer alive
 */
class OverseerCommunication : public QObject
{
    Q_OBJECT
public:
    explicit OverseerCommunication(const quint16 overseerPort_, QObject *parent = nullptr);

    /**
     * @brief isCommunicationWorking: checks communication with overseer
     * @return True if communication tcp socket used for communication is connected
     */
    bool isCommunicationWorking() const;

    /**
     * @brief sendRoomReadyResponse: sends information to overseer that given players are expected at given port
     * @param expectedPlayers_: list of expected players
     * @param port_: port at which players should connect
     */
    void sendRoomReadyResponse(const QStringList& expectedPlayers_, quint16 port_);

    /**
     * @brief sendAuthorizationRequest: sends authorization request to overseer with given credentials
     * @param jwtToken_: access token of a player
     * @param username_: username of a player
     */
    void sendAuthorizationRequest(const QString& jwtToken_, const QString& username_);

signals:
    /**
     * @brief roomRequest: signals that  request for room is received from overseer
     * @param expectedPlayers: list of players' usernames who are requesting a room
     */
    void roomRequest(const QStringList& expectedPlayers);

    /**
     * @brief authorizationSucceed: signals that authorization of given player was succesful
     * @param jwtToken
     * @param username
     */
    void authorizationSucceed(const QString& jwtToken, const QString& username);

    /**
     * @brief authorizationFailed: signals that authorization of given player has failed
     * @param jwtToken
     * @param username
     */
    void authorizationFailed(const QString& jwtToken, const QString& username);

public slots:

private:
    QTcpSocket m_socket;
    const quint16 m_overseerPort {0};
    quint16 m_count {0};
    quint32 m_maxRooms {0};

private slots:
    /**
     * @brief onReadyRead: handles information send to socket by overseer
     *
     * Data comes as JSON object with messageType and content fields. First is just type of message which allows to
     * send content (json object) to proper handling method.
     */
    void onReadyRead();

    /**
     * @brief handleAuthorizationMessage: handles authorization response from overseer and emits proper signal
     * @param content_: credentials and authorization's result (presumably)
     */
    void handleAuthorizationMessage(const QJsonObject& content_);

    /**
     * @brief handleRoomRequestMessage: handles request for room and emits proper signal
     * @param content_: object with array of expected players (presumably)
     */
    void handleRoomRequestMessage(const QJsonObject& content_);
};

#endif // OVERSEERCOMMUNICATION_H
