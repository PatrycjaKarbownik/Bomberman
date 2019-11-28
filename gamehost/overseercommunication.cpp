#include "overseercommunication.h"

OverseerCommunication &OverseerCommunication::getInstance()
{
    // We are not expecting instance to have a QObject parent
    static OverseerCommunication instance;
    return instance;
}

void OverseerCommunication::init(const quint16 overseerPort_, const quint32 maxRooms_)
{
    m_overseerPort = overseerPort_;
    m_maxRooms = maxRooms_;

    m_socket.bind(QHostAddress::LocalHost, m_overseerPort);

    // We can block process while waiting for connection because without it
    // application does not have much to do anyway
    m_socket.waitForConnected();
}

OverseerCommunication::OverseerCommunication(QObject *parent)
    : QObject(parent)
{

}
