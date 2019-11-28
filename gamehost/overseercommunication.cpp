#include "overseercommunication.h"

OverseerCommunication &OverseerCommunication::getInstance()
{
    // We are not expecting instance to have a QObject parent
    static OverseerCommunication instance;
    return instance;
}

void OverseerCommunication::init(qint32 overseerPort_, qint32 maxRooms_)
{
    m_overseerPort = overseerPort_;
    m_maxRooms = maxRooms_;
}

OverseerCommunication::OverseerCommunication(QObject *parent)
    : QObject(parent)
{

}
