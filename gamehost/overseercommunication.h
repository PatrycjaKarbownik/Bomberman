#ifndef OVERSEERCOMMUNICATION_H
#define OVERSEERCOMMUNICATION_H

#include <QObject>

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
    void init(const qint32 overseerPort_, const qint32 maxRooms_);

signals:

public slots:

private:
    explicit OverseerCommunication(QObject *parent = nullptr);
    ~OverseerCommunication();
    OverseerCommunication(const OverseerCommunication&) = delete;
    OverseerCommunication& operator=(const OverseerCommunication&) = delete;

    qint32 m_overseerPort {0};
    qint32 m_maxRooms {0};

};

#endif // OVERSEERCOMMUNICATION_H
