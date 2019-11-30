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
    static OverseerCommunication &getInstance();

    /**
     * @brief init: Initialization of communication properties
     * @param overseerPort_: Port for tcp communication with overseer
     * @param maxRooms_: Maximum number of rooms GameHost is allowed to maintain at once
     * @return true if socket connected to overseer, otherwise false
     */
    bool init(const quint16 overseerPort_, const quint32 maxRooms_);

signals:

public slots:

private:
    explicit OverseerCommunication(QObject *parent = nullptr);
    OverseerCommunication(const OverseerCommunication&) = delete;
    OverseerCommunication& operator=(const OverseerCommunication&) = delete;

    QTimer m_testTimer;
    QTcpSocket m_socket;
    quint16 m_overseerPort {0};
    quint16 m_count {0};
    quint32 m_maxRooms {0};

private slots:
    void onTestTimeout();
    void onReadyRead();
};

#endif // OVERSEERCOMMUNICATION_H
