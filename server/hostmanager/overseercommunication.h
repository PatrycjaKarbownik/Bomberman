#ifndef OVERSEERCOMMUNICATION_H
#define OVERSEERCOMMUNICATION_H

#include <QObject>
#include <QTcpSocket>
#include <QHostAddress>
#include <QTimer>
#include <QJsonObject>
#include <QJsonDocument>

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

    void sendAuthorizationRequest(const QString& jwtToken_, const QString& username_);

signals:
    void roomRequest(const QStringList& expectedPlayers);
    void authorizationSucceed(const QString& jwtToken, const QString& username);
    void authorizationFailed(const QString& jwtToken, const QString& username);

public slots:

private:
    QTcpSocket m_socket;
    const quint16 m_overseerPort {0};
    quint16 m_count {0};
    quint32 m_maxRooms {0};

private slots:
    void onReadyRead();
    void handleAuthorizationMessage(const QJsonObject& content_);
    void handleRoomRequestMessage(const QJsonObject& content_);
};

#endif // OVERSEERCOMMUNICATION_H
