#ifndef OVERSEERCOMMUNICATION_H
#define OVERSEERCOMMUNICATION_H

#include <QObject>
#include <QTcpSocket>
#include <QHostAddress>

class OverseerCommunication : public QObject
{
    Q_OBJECT
public:
    static OverseerCommunication &getInstance();

    /**
     * @brief init: Initialization of communication properties
     * @param overseerPort_: Port for tcp communication with overseer
     * @param maxRooms_: Maximum number of rooms GameHost is allowed to maintain at once
     */
    void init(const quint16 overseerPort_, const quint32 maxRooms_);

signals:

public slots:

private:
    explicit OverseerCommunication(QObject *parent = nullptr);
    OverseerCommunication(const OverseerCommunication&) = delete;
    OverseerCommunication& operator=(const OverseerCommunication&) = delete;

    QTcpSocket m_socket;
    quint16 m_overseerPort {0};
    quint32 m_maxRooms {0};

};

#endif // OVERSEERCOMMUNICATION_H
