#include "overseercommunication.h"

OverseerCommunication &OverseerCommunication::getInstance()
{
    // We are not expecting instance to have a QObject parent
    static OverseerCommunication instance;
    return instance;
}

bool OverseerCommunication::init(const quint16 overseerPort_, const quint32 maxRooms_)
{
    m_overseerPort = overseerPort_;
    m_maxRooms = maxRooms_;

   // m_socket.bind(QHostAddress::LocalHost, m_overseerPort);
    m_socket.connectToHost("localhost", overseerPort_, QTcpSocket::ReadWrite);

    // We can block process while waiting for connection because without it
    // application does not have much to do anyway
    m_socket.waitForConnected(5000);

    if (m_socket.state() != QTcpSocket::ConnectedState) {
        qCritical() << "Socket could not connect!";
        return false;
    }

    m_testTimer.start(1500);
    connect(&m_testTimer, &QTimer::timeout, this, &OverseerCommunication::onTestTimeout);

    return true;
}

OverseerCommunication::OverseerCommunication(QObject *parent)
    : QObject(parent)
{

}

void OverseerCommunication::onTestTimeout()
{
    QJsonObject obj;
    obj.insert("Pati", "Skarb");
    obj.insert("Tromba", "Przystojny");
    m_socket.write(QJsonDocument(obj).toJson());
}
